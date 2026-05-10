export function getColorBySkill(skill) {
  const colorMap = {
    R: 'primary.main',
    L: 'secondary.main',
    S: 'success.main',
    W: 'warning.main',
  };
  return colorMap[skill] || 'primary.main';
}

export function getIconBySkill(skill) {
  const iconMap = {
    R: '📚',
    L: '🎧',
    S: '🗣️',
    W: '✍️',
  };
  return iconMap[skill] || '📊';
}

export function transformTestOverview(backendTests) {
  if (!Array.isArray(backendTests)) {
    return [];
  }

  return backendTests.map((test) => ({
    id: test.id,
    title: test.title,
    color: getColorBySkill(test.skill),
    icon: getIconBySkill(test.skill),
    skill: test.skill,
    level: test.level,
    type: test.type,
  }));
}

function extractBlanks(questions) {
  if (!Array.isArray(questions)) {
    return [];
  }
  return questions.map((q) => q.question_number).sort((a, b) => a - b);
}

export function transformFillBlanksTest(backendTest) {
  const receptiveParts =
    backendTest?.receptive_test?.receptive_parts || backendTest?.receptive_parts;

  if (!backendTest || !receptiveParts) {
    return { parts: [] };
  }

  const parts = receptiveParts
    .filter((part) => part.format === 'I' || part.format === 'H' || part.format === 'D')
    .map((part, index) => {
      const questions = (part.receptive_questions || []).map((q) => ({
        id: q.id,
        question_number: q.question_number,
        question: q.content || '',
        explanation: q.explanation,
        correctLabel: q.receptive_answers?.find((a) => a.is_correct)?.option_label || '',
        correctText: q.receptive_answers?.find((a) => a.is_correct)?.answer_text || '',
        options:
          q.receptive_answers?.map((a) => ({
            id: a.id,
            value: a.option_label,
            label: a.answer_text || '',
            option_label: a.option_label || '',
            answer_text: a.answer_text || '',
            isCorrect: a.is_correct,
          })) || [],
      }));

      return {
        id: part.order || index + 1,
        databaseId: part.id,
        title: `Part ${part.order || index + 1}`,
        passage: part.content || '',
        passageTitle: part.description || '',
        blanks: extractBlanks(part.receptive_questions || []),
        questions,
        componentType: 'fill-blanks',
        rawPart: part,
      };
    });

  return { parts };
}

export function transformMatchingTest(backendTest) {
  const receptiveParts =
    backendTest?.receptive_test?.receptive_parts || backendTest?.receptive_parts;

  if (!backendTest || !receptiveParts) {
    return { parts: [] };
  }

  const parts = receptiveParts
    .filter((part) => part.format === 'J' || part.format === 'E')
    .map((part, index) => {
      const sentences = (part.receptive_questions || []).map((question) => {
        return {
          id: question.id,
          text: question.content || question.explanation || '',
          question_number: question.question_number,
        };
      });

      const gaps = extractBlanks(part.receptive_questions || []);

      let passage = part.content || '';
      if (gaps.length > 0 && !passage.includes('[')) {
        gaps.forEach((gapNum) => {
          const gapPattern = new RegExp(`\\b${gapNum}\\b`, 'g');
          if (passage.match(gapPattern) && !passage.includes(`[${gapNum}]`)) {
            passage = passage.replace(gapPattern, `[${gapNum}]`);
          }
        });
      }

      const questions = (part.receptive_questions || []).map((q) => ({
        id: q.id,
        question_number: q.question_number,
        explanation: q.explanation,
        correctLabel: q.receptive_answers?.find((a) => a.is_correct)?.option_label || '',
        correctText: q.receptive_answers?.find((a) => a.is_correct)?.answer_text || '',
      }));

      return {
        id: part.order || index + 1,
        title: `Part ${part.order || index + 1}`,
        passage: passage,
        passageTitle: part.description || '',
        sentences,
        gaps,
        questions,
        componentType: 'matching',
        rawPart: part,
      };
    });

  return { parts };
}

function isHttpUrlString(s) {
  return typeof s === 'string' && /^https?:\/\//i.test(s.trim());
}

export function transformMultiChoiceTest(backendTest) {
  const receptiveParts =
    backendTest?.receptive_test?.receptive_parts || backendTest?.receptive_parts;

  if (!backendTest || !receptiveParts) {
    return { parts: [] };
  }

  const parts = receptiveParts
    .filter(
      (part) =>
        part.format === 'F' ||
        part.format === 'G' ||
        part.format === 'A' ||
        part.format === 'B' ||
        part.format === 'C',
    )
    .map((part, index) => {
      const rawQuestions = part.receptive_questions || [];
      let passage = part.content || '';
      let stimulusPageUrls = null;
      const stripQuestionIds = new Set();

      if (part.format === 'F' && !String(passage).trim()) {
        const urlQuestions = rawQuestions
          .filter((q) => isHttpUrlString(q.content))
          .sort((a, b) => (a.question_number || 0) - (b.question_number || 0));
        if (urlQuestions.length >= 1) {
          stimulusPageUrls = urlQuestions.map((q) => String(q.content).trim());
          urlQuestions.forEach((q) => stripQuestionIds.add(q.id));
        }
      }

      const questions = rawQuestions.map((question) => {
        const options =
          question.receptive_answers?.map((answer) => ({
            id: answer.id,
            value: answer.option_label,
            label: answer.answer_text || '',
            option_label: answer.option_label || '',
            answer_text: answer.answer_text || '',
            isCorrect: answer.is_correct,
          })) || [];

        const stem = stripQuestionIds.has(question.id) ? '' : question.content;

        return {
          id: question.id,
          questionNumber: question.question_number,
          question: stem,
          explanation: question.explanation,
          options,
        };
      });

      return {
        id: part.order || index + 1,
        databaseId: part.id,
        title: `Part ${part.order || index + 1}`,
        passage,
        passageTitle: part.description || '',
        questions,
        /** Format F: nhiều URL stem cũ — fetch từng trang, đánh số 1..n bên trái */
        stimulusPageUrls,
        componentType: 'multi-choice',
        rawPart: part,
      };
    });

  return { parts };
}

export function getFormatName(formatCode) {
  const formatMap = {
    A: 'Listening - Multiple Choice images',
    B: 'Listening - Multiple Choice text (one audio per question)',
    C: 'Listening - Multiple Choice text (one audio for all questions)',
    D: 'Listening - Fill in the blanks',
    E: 'Listening - Matching',
    F: 'Reading - Multiple Choice (short text)',
    G: 'Reading - Multiple Choice (long text)',
    H: 'Reading - Fill in the blanks (multiple choice)',
    I: 'Reading - Fill in the blanks (text)',
    J: 'Reading - Matching',
  };
  return formatMap[formatCode] || 'Unknown format';
}

export function isFormatCompatible(formatCode, componentType) {
  const compatibility = {
    'fill-blanks': ['H', 'I', 'D'],
    matching: ['E', 'J'],
    'multi-choice': ['A', 'B', 'C', 'F', 'G'],
  };

  return compatibility[componentType]?.includes(formatCode) || false;
}

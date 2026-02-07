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
    .filter((part) => part.format === 'I' || part.format === 'H')
    .map((part, index) => ({
      id: part.order || index + 1,
      title: `Part ${part.order || index + 1}`,
      passage: part.content || '',
      passageTitle: part.description || '',
      blanks: extractBlanks(part.receptive_questions || []),
    }));

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
      const allAnswers = new Map();
      part.receptive_questions?.forEach((question) => {
        question.receptive_answers?.forEach((answer) => {
          if (!allAnswers.has(answer.option_label)) {
            allAnswers.set(answer.option_label, {
              id: answer.option_label,
              text: answer.answer_text,
            });
          }
        });
      });

      const sentences = Array.from(allAnswers.values()).sort((a, b) => a.id.localeCompare(b.id));

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

      return {
        id: part.order || index + 1,
        title: `Part ${part.order || index + 1}`,
        passage: passage,
        passageTitle: part.description || '',
        sentences,
        gaps,
      };
    });

  return { parts };
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
      const questions =
        part.receptive_questions?.map((question, qIndex) => {
          const options =
            question.receptive_answers?.map((answer) => ({
              value: answer.option_label,
              label: `${answer.option_label}. ${answer.answer_text}`,
            })) || [];

          return {
            id: `q${question.question_number || qIndex + 1}`,
            question: question.content,
            options,
          };
        }) || [];

      return {
        id: part.order || index + 1,
        title: `Part ${part.order || index + 1}`,
        passage: part.content || '',
        passageTitle: part.description || '',
        questions,
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

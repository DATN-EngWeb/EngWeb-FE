const getAudioObj = (url) => (url ? { name: url.split('/').pop(), url } : null);
const getPartScoreValue = (part) => parseFloat(part?.score ?? part?.totalScore ?? 0) || 0;

const transformAnswers = (answers, type) =>
  answers.map((a, i) => ({
    id: a.id,
    label: a.option_label || String.fromCharCode(65 + i),
    ...(type === 'image'
      ? { image: getAudioObj(a.resources?.image) }
      : { text: a.answer_text || '' }),
    is_correct: a.is_correct,
  }));

export const transformApiResponseToParts = (apiData) => {
  if (!apiData?.receptive_test?.receptive_parts) return [];

  const formatMap = {
    A: 'multichoice_images',
    B: 'multichoice_texts',
    C: 'multichoice_texts',
    D: 'fill_in_the_blanks',
    E: 'matching',
  };

  return apiData.receptive_test.receptive_parts
    .map((part) => {
      const type = formatMap[part.format];
      if (!type) return null;

      const base = {
        id: part.id,
        type,
        order: part.order,
        description: part.description || '',
        score: part.score,
        totalScore: part.score,
      };

      if (type === 'multichoice_images') {
        return {
          ...base,
          audio: getAudioObj(part.resources?.audio),
          questions: (part.receptive_questions || []).map((q, i) => {
            const answers = transformAnswers(q.receptive_answers, 'image');
            return {
              id: q.id,
              question_number: q.question_number || i + 1,
              text: q.content || '',
              explanation: q.explanation || '',
              score: q.score || 0,
              answers,
              correctIndex: answers.findIndex((a) => a.is_correct),
            };
          }),
        };
      }

      if (type === 'multichoice_texts') {
        return {
          ...base,
          audioFormat: part.format === 'C' ? 'onetomany' : 'onetoone',
          ...(part.format === 'C' && {
            audio: getAudioObj(part.resources?.audio),
            _contentUrl: part.content?.startsWith('http') ? part.content : null,
          }),
          questions: (part.receptive_questions || []).map((q, i) => {
            const answers = transformAnswers(q.receptive_answers, 'text');
            return {
              id: q.id,
              question_number: q.question_number || i + 1,
              text: q.content || '',
              explanation: q.explanation || '',
              score: q.score || 0,
              answers,
              correctIndex: answers.findIndex((a) => a.is_correct),
              ...(part.format === 'B' &&
                q.resources?.audio && { audio: getAudioObj(q.resources.audio) }),
            };
          }),
        };
      }

      if (type === 'fill_in_the_blanks') {
        return {
          ...base,
          audio: getAudioObj(part.resources?.audio),
          _contentUrl: part.content?.startsWith('http') ? part.content : null,
          answers: (part.receptive_questions || []).map((q, idx) => ({
            id: `blank-${q.id}`,
            text: q.receptive_answers?.[0]?.answer_text || '',
            option_label: q.receptive_answers?.[0]?.option_label || String.fromCharCode(65 + idx),
            explanation: q.explanation || '',
            score: q.score || 0,
          })),
          questions: (part.receptive_questions || []).map((q, i) => ({
            id: q.id,
            question_number: q.question_number || i + 1,
            text: q.content || '',
            explanation: q.explanation || '',
            score: q.score || 0,
          })),
        };
      }

      if (type === 'matching') {
        const ansMap = new Map();
        (part.receptive_questions || []).forEach((q) =>
          q.receptive_answers?.forEach(
            (a) =>
              !ansMap.has(a.id) &&
              ansMap.set(a.id, { id: `ans-${a.id}`, text: a.answer_text || '' }),
          ),
        );

        return {
          ...base,
          audio: getAudioObj(part.resources?.audio),
          questions: (part.receptive_questions || []).map((q, i) => ({
            id: q.id,
            question_number: q.question_number || i + 1,
            text: q.content || '',
            explanation: q.explanation || '',
            score: q.score || 0,
            selectedAnswerId: q.receptive_answers?.[0] ? `ans-${q.receptive_answers[0].id}` : null,
          })),
          answers: Array.from(ansMap.values()),
        };
      }

      return null;
    })
    .filter(Boolean);
};

export const collectFiles = (parts) => {
  const files = [];

  parts.forEach((part, partIdx) => {
    if (!part.type) return;

    if (part.audio?.file) {
      files.push({
        filename: part.audio.file.name,
        file: part.audio.file,
        fileSize: part.audio.file.size,
        mimeType: part.audio.file.type,
        partOrder: partIdx + 1,
      });
    }

    part.questions?.forEach((q) => {
      if (q.audio?.file) {
        files.push({
          filename: q.audio.file.name,
          file: q.audio.file,
          fileSize: q.audio.file.size,
          mimeType: q.audio.file.type,
          partOrder: partIdx + 1,
        });
      }

      q.answers?.forEach((ans) => {
        if (ans.image?.file) {
          files.push({
            filename: ans.image.file.name,
            file: ans.image.file,
            fileSize: ans.image.file.size,
            mimeType: ans.image.file.type,
            partOrder: partIdx + 1,
          });
        }
      });
    });
    const order = part.order || partIdx + 1;
    if (part?.content && typeof part.content === 'string' && part.content.trim().length > 0) {
      const filename = `part${order}_content.html`;
      const file = new File([part.content], filename, { type: 'text/html' });
      files.push({
        filename,
        file,
        fileSize: file.size,
        mimeType: 'text/html',
        partOrder: order,
      });
    }
  });

  return files;
};

export const generatePayloadWithActions = (originalParts, currentParts, urlMap) => {
  const originalPartMap = new Map(originalParts?.map((p) => [p.id, p]) || []);
  const currentPartMap = new Map(currentParts.map((p) => [p.id, p]));

  const resultParts = [];

  for (const [partId, originalPart] of originalPartMap.entries()) {
    const currentPart = currentPartMap.get(partId);

    if (!currentPart) {
      // Part was deleted
      resultParts.push({
        action: 'delete',
        id: originalPart.id,
      });
      continue;
    }

    // Part exists, check if updated
    const partPayload = generatePartPayload(originalPart, currentPart, urlMap, 'update');
    if (partPayload) {
      resultParts.push(partPayload);
    }
  }

  // Handle new parts (create)
  for (const [partId, currentPart] of currentPartMap.entries()) {
    if (!originalPartMap.has(partId)) {
      const partPayload = generatePartPayload(null, currentPart, urlMap, 'create');
      if (partPayload) {
        resultParts.push(partPayload);
      }
    }
  }

  return resultParts;
};

const generatePartPayload = (originalPart, currentPart, urlMap, _defaultAction) => {
  const resolve = (name) => {
    if (!name) return '';
    return urlMap[name] || name;
  };

  const isUpdate = originalPart !== null;

  let partToProcess = currentPart;
  if (currentPart.type === 'fill_in_the_blanks' && currentPart.answers && currentPart.questions) {
    partToProcess = {
      ...currentPart,
      questions: (currentPart.questions || []).map((q, qIdx) => ({
        ...q,
        score: currentPart.answers?.[qIdx]?.score ?? q.score,
      })),
    };
  }

  if (
    currentPart.type === 'fill_in_the_blanks' &&
    currentPart.answers &&
    currentPart.answers.length > 0
  ) {
    partToProcess = {
      ...partToProcess,
      questions: currentPart.answers.map((ans, idx) => {
        let questionId = ans.id;
        if (typeof ans.id === 'string' && ans.id.startsWith('blank-')) {
          const numericId = ans.id.replace('blank-', '');
          questionId = isNaN(numericId) ? ans.id : parseInt(numericId);
        }

        return {
          id: questionId,
          question_number: idx + 1,
          text: ans.text || '',
          explanation: ans.explanation || '',
          score: ans.score || partToProcess.score || partToProcess.totalScore || 0,
          answers: [
            {
              id: ans.id || `answer-${idx}`,
              option_label: ans.option_label || String.fromCharCode(65 + idx),
              answer_text: ans.text || '',
              is_correct: true,
            },
          ],
        };
      }),
    };
  }

  const originalQuestionMap = new Map(originalPart?.questions?.map((q) => [q.id, q]) || []);
  const currentQuestionMap = new Map(partToProcess.questions?.map((q) => [q.id, q]) || []);

  const receptiveQuestions = [];
  let hasQuestionChanges = false;

  // Update/delete existing questions
  for (const [qId, originalQ] of originalQuestionMap.entries()) {
    const currentQ = currentQuestionMap.get(qId);

    if (!currentQ) {
      // Question deleted
      receptiveQuestions.push({
        action: 'delete',
        id: originalQ.id,
      });
      hasQuestionChanges = true;
      continue;
    }

    // Question exists, check if updated
    const qPayload = generateQuestionPayload(
      originalQ,
      currentQ,
      partToProcess.type,
      partToProcess.order,
      urlMap,
      'update',
      partToProcess.answers || [],
    );
    if (qPayload) {
      receptiveQuestions.push(qPayload);
      hasQuestionChanges = true;
    }
  }

  for (const [qId, currentQ] of currentQuestionMap.entries()) {
    if (!originalQuestionMap.has(qId)) {
      const qPayload = generateQuestionPayload(
        null,
        currentQ,
        partToProcess.type,
        partToProcess.order,
        urlMap,
        'create',
        partToProcess.answers || [],
      );
      if (qPayload) {
        receptiveQuestions.push(qPayload);
      }
      hasQuestionChanges = true;
    }
  }

  if (isUpdate) {
    // Check if part-level fields changed
    const orderChanged = originalPart.order !== partToProcess.order;
    const formatChanged =
      getFormatCode(originalPart.type, originalPart.audioFormat) !==
      getFormatCode(partToProcess.type, partToProcess.audioFormat);
    const audioFormatChanged = originalPart.audioFormat !== partToProcess.audioFormat;
    const descriptionChanged =
      (originalPart.description || '') !== (partToProcess.description || '');
    const contentChanged = (originalPart.content || '') !== (partToProcess.content || '');
    const scoreChanged =
      (originalPart.score ?? originalPart.totalScore ?? 0) !==
      (partToProcess.score ?? partToProcess.totalScore ?? 0);

    // Check audio changes
    const originalAudio = originalPart.audio?.url || originalPart.audio?.name || '';
    const currentAudio =
      partToProcess.audio?.url ||
      partToProcess.audio?.name ||
      partToProcess.audio?.file?.name ||
      '';
    const audioChanged = originalAudio !== currentAudio;

    if (
      !orderChanged &&
      !formatChanged &&
      !audioFormatChanged &&
      !descriptionChanged &&
      !contentChanged &&
      !scoreChanged &&
      !audioChanged &&
      !hasQuestionChanges
    ) {
      return null;
    }

    const payload = {
      action: 'update',
      id: originalPart.id,
      order: partToProcess.order ?? originalPart.order,
    };

    if (formatChanged)
      payload.format = getFormatCode(partToProcess.type, partToProcess.audioFormat);
    if (scoreChanged) payload.score = partToProcess.score ?? partToProcess.totalScore ?? 0;
    if (descriptionChanged) payload.description = partToProcess.description || '';

    // Handle content
    if (contentChanged) {
      if (partToProcess.content) {
        const contentFilename = `part${partToProcess.order}_content.html`;
        payload.content = resolve(contentFilename);
      } else {
        payload.content = originalPart.content;
      }
    } else if (audioFormatChanged && partToProcess.audioFormat === 'onetomany') {
      if (partToProcess.content) {
        const contentFilename = `part${partToProcess.order}_content.html`;
        payload.content = resolve(contentFilename);
      }
    }

    // Handle audio
    if (audioChanged) {
      if (!payload.resources) payload.resources = {};
      if (partToProcess.audio?.file || partToProcess.audio?.name || partToProcess.audio?.url) {
        const audioName = resolve(partToProcess.audio?.file?.name || partToProcess.audio?.name);
        payload.resources.audio = audioName;
      } else if (originalPart?.audio?.name || originalPart?.audio?.url) {
        payload.resources.audio = originalPart.audio.url || originalPart.audio.name;
      }
    } else if (audioFormatChanged && partToProcess.audioFormat === 'onetomany') {
      if (partToProcess.audio?.file || partToProcess.audio?.name || partToProcess.audio?.url) {
        if (!payload.resources) payload.resources = {};
        const audioName = resolve(partToProcess.audio?.file?.name || partToProcess.audio?.name);
        payload.resources.audio = audioName;
      }
    }

    if (audioFormatChanged && partToProcess.type === 'multichoice_texts') {
      // Force questions to be included when format changes
      payload.receptive_questions = receptiveQuestions.length > 0 ? receptiveQuestions : [];
    } else if (hasQuestionChanges) {
      // Add questions if there are changes
      payload.receptive_questions = receptiveQuestions;
    }

    return payload;
  }

  const partOrder = partToProcess.order || 1;

  const payload = {
    action: 'create',
    order: partOrder,
    format: getFormatCode(partToProcess.type, partToProcess.audioFormat),
    description: partToProcess.description || '',
  };

  // Handle content
  if (partToProcess.content) {
    if (partOrder) {
      const contentFilename = `part${partOrder}_content.html`;
      const resolvedContent = resolve(contentFilename);
      payload.content = resolvedContent || partToProcess.content;
    } else {
      payload.content = partToProcess.content;
    }
  }

  if (partToProcess.audio?.file || partToProcess.audio?.name || partToProcess.audio?.url) {
    const audioName = resolve(partToProcess.audio?.file?.name || partToProcess.audio?.name);
    payload.resources = { audio: audioName };
  }

  if (receptiveQuestions.length > 0) {
    payload.receptive_questions = receptiveQuestions;
  }

  return payload;
};

const generateQuestionPayload = (
  originalQ,
  currentQ,
  partType,
  partOrder,
  urlMap,
  _defaultAction,
  partAnswers = [],
) => {
  const resolve = (name) => {
    if (!name) return '';
    return urlMap[name] || name;
  };

  const isUpdate = originalQ !== null;

  let currentQWithAnswers = currentQ;
  let originalQWithAnswers = originalQ;

  if (partType === 'matching') {
    if (currentQ.selectedAnswerId) {
      const selectedAnswerIndex = partAnswers.findIndex(
        (ans) => ans.id === currentQ.selectedAnswerId,
      );
      const selectedAnswer = partAnswers[selectedAnswerIndex];
      if (selectedAnswer) {
        currentQWithAnswers = {
          ...currentQ,
          answers: [
            {
              id: selectedAnswer.id,
              option_label:
                selectedAnswer.option_label ||
                selectedAnswer.label ||
                String.fromCharCode(65 + selectedAnswerIndex),
              answer_text: selectedAnswer.text || selectedAnswer.answer_text || '',
              is_correct: true,
            },
          ],
        };
      }
    }

    if (originalQ?.selectedAnswerId) {
      const selectedAnswerIndex = partAnswers.findIndex(
        (ans) => ans.id === originalQ.selectedAnswerId,
      );
      const selectedAnswer = partAnswers[selectedAnswerIndex];
      if (selectedAnswer) {
        originalQWithAnswers = {
          ...originalQ,
          answers: [
            {
              id: selectedAnswer.id,
              option_label:
                selectedAnswer.option_label ||
                selectedAnswer.label ||
                String.fromCharCode(65 + selectedAnswerIndex),
              answer_text: selectedAnswer.text || selectedAnswer.answer_text || '',
              is_correct: true,
            },
          ],
        };
      }
    }
  }

  const originalAnswerMap = new Map(originalQWithAnswers?.answers?.map((a) => [a.id, a]) || []);
  const currentAnswerMap = new Map(currentQWithAnswers.answers?.map((a) => [a.id, a]) || []);

  const receptiveAnswers = [];
  let hasAnswerChanges = false;

  for (const [aId, originalA] of originalAnswerMap.entries()) {
    const currentA = currentAnswerMap.get(aId);

    if (!currentA) {
      if (typeof originalA.id === 'number') {
        receptiveAnswers.push({
          action: 'delete',
          id: originalA.id,
        });
        hasAnswerChanges = true;
      }
      continue;
    }

    const aPayload = generateAnswerPayload(originalA, currentA, urlMap, 'update');
    if (aPayload) {
      receptiveAnswers.push(aPayload);
      hasAnswerChanges = true;
    }
  }

  for (const [aId, currentA] of currentAnswerMap.entries()) {
    if (!originalAnswerMap.has(aId)) {
      const aPayload = generateAnswerPayload(null, currentA, urlMap, 'create');
      if (aPayload) {
        receptiveAnswers.push(aPayload);
      }
      hasAnswerChanges = true;
    }
  }

  if (isUpdate) {
    // Check if question-level fields changed
    const textChanged = (originalQ.text || '') !== (currentQ.text || '');
    const explanationChanged = (originalQ.explanation || '') !== (currentQ.explanation || '');
    const scoreChanged =
      parseFloat(originalQ.score || originalQ.totalScore || 0) !==
      parseFloat(currentQ.score || currentQ.totalScore || 0);
    const questionNumberChanged =
      (originalQ.question_number || 1) !== (currentQ.question_number || 1);

    // Check question-level resources
    const originalAudio = originalQ.audio?.url || originalQ.audio?.name || '';
    const currentAudio =
      currentQ.audio?.url || currentQ.audio?.name || currentQ.audio?.file?.name || '';
    const audioChanged = originalAudio !== currentAudio;

    const originalImage = originalQ.image?.url || originalQ.image?.name || '';
    const currentImage =
      currentQ.image?.url || currentQ.image?.name || currentQ.image?.file?.name || '';
    const imageChanged = originalImage !== currentImage;

    if (
      !textChanged &&
      !explanationChanged &&
      !scoreChanged &&
      !questionNumberChanged &&
      !audioChanged &&
      !imageChanged &&
      !hasAnswerChanges
    ) {
      return null;
    }

    const payload = {
      action: 'update',
      id: originalQ.id,
      question_number: currentQ.question_number || 1,
    };

    if (textChanged) payload.content = currentQ.text || '';
    if (explanationChanged) payload.explanation = currentQ.explanation || '';
    if (scoreChanged) payload.score = parseFloat(currentQ.score || currentQ.totalScore || 0) || 0;

    // Handle resources
    const resources = {};
    if (audioChanged) {
      if (currentQ.audio?.file || currentQ.audio?.name || currentQ.audio?.url) {
        resources.audio = resolve(currentQ.audio?.file?.name || currentQ.audio?.name);
      } else if (originalQ?.audio?.name || originalQ?.audio?.url) {
        resources.audio = originalQ.audio.url || originalQ.audio.name;
      }
    }
    if (imageChanged) {
      if (currentQ.image?.file || currentQ.image?.name || currentQ.image?.url) {
        resources.image = resolve(currentQ.image?.file?.name || currentQ.image?.name);
      } else if (originalQ?.image?.name || originalQ?.image?.url) {
        resources.image = originalQ.image.url || originalQ.image.name;
      }
    }
    if (Object.keys(resources).length > 0) {
      payload.resources = resources;
    }

    if (hasAnswerChanges) {
      payload.receptive_answers = receptiveAnswers;
    }

    return payload;
  }

  const payload = {
    action: 'create',
    question_number: currentQ.question_number || 1,
    content: currentQ.text || '',
    explanation: currentQ.explanation || '',
    score: parseFloat(currentQ.score || currentQ.totalScore || 0) || 0,
  };

  // Handle question-level resources
  const resources = {};

  if (currentQ.audio?.file || currentQ.audio?.name || currentQ.audio?.url) {
    resources.audio = resolve(currentQ.audio?.file?.name || currentQ.audio?.name);
  }

  if (currentQ.image?.file || currentQ.image?.name || currentQ.image?.url) {
    resources.image = resolve(currentQ.image?.file?.name || currentQ.image?.name);
  }

  if (Object.keys(resources).length > 0) {
    payload.resources = resources;
  }

  if (receptiveAnswers.length > 0) {
    payload.receptive_answers = receptiveAnswers;
  }

  return payload;
};

const generateAnswerPayload = (originalA, currentA, urlMap, _defaultAction) => {
  const resolve = (name) => {
    if (!name) return '';
    return urlMap[name] || name;
  };

  const isUpdate = originalA !== null;

  if (isUpdate) {
    // Check if answer-level fields changed
    const labelChanged =
      (originalA.label || originalA.option_label || '') !==
      (currentA.option_label || currentA.label || '');
    const textChanged =
      (originalA.text || originalA.answer_text || '') !==
      (currentA.answer_text || currentA.text || '');
    const correctChanged = (originalA.is_correct || false) !== (currentA.is_correct || false);

    // Check answer resources
    const originalImage = originalA.image?.url || originalA.image?.name || '';
    const currentImage =
      currentA.image?.url || currentA.image?.name || currentA.image?.file?.name || '';
    const imageChanged = originalImage !== currentImage;

    const originalAudio = originalA.audio?.url || originalA.audio?.name || '';
    const currentAudio =
      currentA.audio?.url || currentA.audio?.name || currentA.audio?.file?.name || '';
    const audioChanged = originalAudio !== currentAudio;

    if (!labelChanged && !textChanged && !correctChanged && !imageChanged && !audioChanged) {
      return null;
    }

    if (typeof originalA.id !== 'number') {
      return null;
    }

    const payload = {
      action: 'update',
      id: originalA.id,
    };

    if (labelChanged) payload.option_label = currentA.option_label || currentA.label || '';
    if (textChanged) payload.answer_text = currentA.answer_text || currentA.text || '';
    if (correctChanged) payload.is_correct = currentA.is_correct || false;

    // Handle answer resources
    const resources = {};

    if (imageChanged) {
      if (currentA.image?.file || currentA.image?.name || currentA.image?.url) {
        resources.image = resolve(currentA.image?.file?.name || currentA.image?.name);
      } else if (originalA?.image?.name || originalA?.image?.url) {
        resources.image = originalA.image.url || originalA.image.name;
      }
    }

    if (audioChanged) {
      if (currentA.audio?.file || currentA.audio?.name || currentA.audio?.url) {
        resources.audio = resolve(currentA.audio?.file?.name || currentA.audio?.name);
      } else if (originalA?.audio?.name || originalA?.audio?.url) {
        resources.audio = originalA.audio.url || originalA.audio.name;
      }
    }

    if (Object.keys(resources).length > 0) {
      payload.resources = resources;
    }

    return payload;
  }

  const optionLabel = currentA.option_label || currentA.label || 'A';
  const answerText = currentA.answer_text || currentA.text || optionLabel;

  const payload = {
    action: 'create',
    option_label: optionLabel,
    answer_text: answerText,
    is_correct: currentA.is_correct || false,
  };

  const resources = {};

  if (currentA.image?.file || currentA.image?.name || currentA.image?.url) {
    resources.image = resolve(currentA.image?.file?.name || currentA.image?.name);
  }

  if (currentA.audio?.file || currentA.audio?.name || currentA.audio?.url) {
    resources.audio = resolve(currentA.audio?.file?.name || currentA.audio?.name);
  }

  if (Object.keys(resources).length > 0) {
    payload.resources = resources;
  }

  return payload;
};

const getFormatCode = (type, audioFormat) => {
  const formatMap = {
    multichoice_images: 'A',
    multichoice_texts: audioFormat === 'onetomany' ? 'C' : 'B',
    fill_in_the_blanks: 'D',
    matching: 'E',
  };
  return formatMap[type] || 'A';
};

export const transformPartsForSubmitWithUrls = (parts, urlMap) => {
  const resolve = (name) => {
    if (!name) return '';
    return urlMap[name] || name;
  };

  return parts
    .filter((p) => p.type)
    .map((part, index) => {
      const order = index + 1;

      const commonAudioName = resolve(part.audio?.file?.name || part.audio?.name);

      if (part.type === 'multichoice_images') {
        return {
          order,
          format: 'A',
          description: part.description || '',
          resources: { audio: commonAudioName },
          questions: (part.questions || []).map((q, qIdx) => ({
            question_number: q.question_number || qIdx + 1,
            content: q.text || '',
            explanation: q.explanation || '',
            score: getPartScoreValue(part),
            answers: (q.answers || []).map((ans, aIdx) => ({
              option_label: ans.option_label || String.fromCharCode(65 + aIdx),
              is_correct: q.correctIndex === aIdx || ans.is_correct || false,
              resources: {
                image: resolve(ans.image?.file?.name || ans.image?.name),
              },
            })),
          })),
        };
      }

      if (part.type === 'multichoice_texts') {
        const isOneToOne = part.audioFormat === 'onetoone';
        return {
          order,
          format: isOneToOne ? 'B' : 'C',
          description: part.description || '',
          content: !isOneToOne && part.content ? resolve(`part${order}_content.html`) : undefined,
          resources: isOneToOne
            ? undefined
            : {
                audio: commonAudioName,
              },
          questions: (part.questions || []).map((q, qIdx) => ({
            question_number: q.question_number || qIdx + 1,
            content: q.text || '',
            explanation: q.explanation || '',
            score: getPartScoreValue(part),
            resources: isOneToOne
              ? {
                  audio: resolve(q.audio?.file?.name || q.audio?.name),
                }
              : undefined,
            answers: (q.answers || []).map((ans, aIdx) => ({
              option_label: ans.option_label || String.fromCharCode(65 + aIdx),
              answer_text: ans.text || ans.answer_text || '',
              is_correct: q.correctIndex === aIdx || ans.is_correct || false,
            })),
          })),
        };
      }

      if (part.type === 'fill_in_the_blanks') {
        return {
          order,
          format: 'D',
          description: part.description || '',
          content: resolve(`part${order}_content.html`),
          resources: {
            audio: commonAudioName,
          },
          questions: (part.answers || []).map((ans, aIdx) => ({
            question_number: ans.question_number || aIdx + 1,
            explanation: ans.explanation || '',
            score: getPartScoreValue(part),
            answers: [
              {
                option_label: ans.option_label || String.fromCharCode(65 + aIdx),
                answer_text: ans.text || ans.answer || '',
                is_correct: true,
              },
            ],
          })),
        };
      }

      if (part.type === 'matching') {
        const answerIdToLabel = new Map();
        (part.answers || []).forEach((ans, aIdx) => {
          const label = ans.option_label || String.fromCharCode(65 + aIdx);
          if (ans.id) answerIdToLabel.set(ans.id, label);
        });

        return {
          order,
          format: 'E',
          description: part.description || '',
          resources: {
            audio: commonAudioName,
          },
          questions: (part.questions || []).map((q, qIdx) => {
            const answerObj = q.selectedAnswerId
              ? part.answers?.find((ans) => ans.id === q.selectedAnswerId)
              : null;

            const answerLabel = answerObj
              ? answerObj.option_label || answerIdToLabel.get(q.selectedAnswerId) || ''
              : '';

            return {
              question_number: q.question_number || qIdx + 1,
              content: q.text || '',
              explanation: q.explanation || '',
              score: getPartScoreValue(part),
              answers: answerObj
                ? [
                    {
                      option_label: answerLabel,
                      is_correct: true,
                      answer_text: answerObj.text || answerObj.answer_text || '',
                    },
                  ]
                : [],
            };
          }),
        };
      }

      return null;
    })
    .filter(Boolean);
};

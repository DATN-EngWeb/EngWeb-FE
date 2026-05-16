// Validate basic information
export const validateBasicInfo = (basicInfo) => {
  const errors = {};

  if (!basicInfo.testName?.trim()) errors.testName = true;
  if (!basicInfo.level?.trim()) errors.level = true;
  const timeValue = parseInt(basicInfo.time);
  if (!basicInfo.time || isNaN(timeValue) || timeValue === 0) {
    errors.time = true;
  } else if (timeValue < 0) {
    errors.timeNegative = true;
  }
  if (!basicInfo.description?.trim()) errors.description = true;

  return errors;
};

export const validateListeningBasicInfo = (basicInfo) => {
  const errors = validateBasicInfo(basicInfo);
  return Object.keys(errors).length > 0 ? errors : null;
};

// Get user-friendly error message
export const getValidationErrorMessage = (errors) => {
  if (!errors) return null;

  // Always show Basic Information errors first.
  if (errors.basicInfo?.testName) return 'Please enter the test title';
  if (errors.basicInfo?.time) return 'Please enter a valid test time';
  if (errors.basicInfo?.timeNegative) return 'Test time cannot be negative';
  if (errors.basicInfo?.description) return 'Please enter the test description';
  if (errors.basicInfo?.level) return 'Please select a level';

  if (errors.parts?.some((p) => p?.totalScoreNegative)) return 'Score cannot be negative';
  if (errors.noParts) return 'Test must have at least 1 part';
  if (errors.parts?.some((p) => p?.noQuestions)) return 'Each part must have at least 1 question';
  if (
    errors.parts?.some(
      (p) =>
        p?.questions && Object.keys(p.questions).some((qIdx) => p.questions[qIdx]?.correctIndex),
    )
  )
    return 'Please select the correct answer for each question';
  if (
    errors.parts?.some(
      (p) => p?.questions && Object.keys(p.questions).some((qIdx) => p.questions[qIdx]?.answers),
    )
  )
    return 'Each question must have at least 2 answers';
  if (
    errors.parts?.some(
      (p) =>
        p?.questions &&
        Object.keys(p.questions).some((qIdx) => p.questions[qIdx]?.answerTexts?.some(Boolean)),
    )
  )
    return 'All answer texts must be filled';
  if (
    errors.parts?.some(
      (p) =>
        p?.questions &&
        Object.keys(p.questions).some((qIdx) => p.questions[qIdx]?.answerImages?.some(Boolean)),
    )
  )
    return 'All answer images must be uploaded';
  if (errors.parts?.some((p) => p?.answers?.some(Boolean)))
    return 'All answer texts must be filled';

  return 'Please fill out the required field';
};

export const validateReadingPartPayload = (parts) => {
  const isEmptyText = (text) => {
    if (!text) return true;
    const trimmed = String(text).trim();
    return trimmed === '' || trimmed === '<p><br></p>' || trimmed === '<p></p>';
  };

  const formatPartMessage = (partName, message) => `Part ${partName}: ${message}`;
  const formatQuestionMessage = (partName, qNum, message) =>
    `Part ${partName}, Question ${qNum}: ${message}`;

  if (!parts || parts.length === 0) {
    return 'The test has no parts.';
  }

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const partName = `Part ${part.order || i + 1}`;
    const format = part.format;

    if (['G', 'H', 'I', 'J'].includes(format)) {
      if (isEmptyText(part.content)) {
        return formatPartMessage(partName, 'add the passage content.');
      }
    }

    if (!part.questions || part.questions.length === 0) {
      return formatPartMessage(partName, 'add at least one question.');
    }

    for (let j = 0; j < part.questions.length; j++) {
      const q = part.questions[j];
      const qNum = q.question_number || j + 1;

      if (!q.answers || q.answers.length === 0) {
        return formatQuestionMessage(partName, qNum, 'add at least one answer.');
      }

      if (['F', 'G', 'H'].includes(format)) {
        if (q.answers.length < 3) {
          return formatQuestionMessage(partName, qNum, 'add at least 3 answer options.');
        }
      }

      // Đã xóa 'H' khỏi mảng kiểm tra này để bỏ qua validate q.content cho Format H
      if (['F', 'G', 'J'].includes(format)) {
        if (isEmptyText(q.content)) {
          return formatQuestionMessage(partName, qNum, 'add the question content.');
        }
      }

      if (['F', 'G', 'H'].includes(format)) {
        for (let k = 0; k < q.answers.length; k++) {
          const ans = q.answers[k];
          if (isEmptyText(ans.answer_text)) {
            const label = ans.option_label ? `(${ans.option_label})` : `Option ${k + 1}`;
            return formatQuestionMessage(partName, qNum, `fill in answer ${label}.`);
          }
        }
      }

      if (format === 'I') {
        const correctAns = q.answers.find((a) => a.is_correct);
        if (correctAns && isEmptyText(correctAns.answer_text)) {
          return formatQuestionMessage(partName, qNum, 'fill in the correct answer.');
        }
      }

      const hasCorrectAnswer = q.answers.some((ans) => ans.is_correct === true);
      if (!hasCorrectAnswer) {
        return formatQuestionMessage(partName, qNum, 'choose the correct answer.');
      }

      const parsedScore = parseInt(q.score, 10);
      if (isNaN(parsedScore) || Number(q.score) !== parsedScore || parsedScore <= 0) {
        return formatQuestionMessage(partName, qNum, 'enter a score greater than 0.');
      }
    }
  }
  return null;
};

export const validateReadingPartUpdatePayload = (transformedParts, originalParts) => {
  if (!originalParts || !Array.isArray(originalParts) || originalParts.length === 0) {
    return null;
  }

  const activeOriginalParts = originalParts.filter((p) => p.action !== 'delete');
  const hasDeletedPart = originalParts.some((p) => p.action === 'delete');

  if (hasDeletedPart) {
    if (activeOriginalParts.length === 0) {
      return 'The test must have at least one active part.';
    }
  }

  for (let i = 0; i < activeOriginalParts.length; i++) {
    const p = activeOriginalParts[i];
    const displayNum = p.order || i + 1;
    const score = p.scoreForEachQuestion;

    if (
      score === undefined ||
      score === null ||
      score === '' ||
      isNaN(score) ||
      Number(score) === 0
    ) {
      return `Score for each question in Part ${displayNum} has not been filled.`;
    }
  }

  for (let pIndex = 0; pIndex < transformedParts.length; pIndex++) {
    const tPart = transformedParts[pIndex];

    if (tPart.action === 'delete') continue;

    const originalPart = originalParts.find((p) => p.id === tPart.id) || tPart;
    const displayPartNum =
      originalPart.order ||
      tPart.order ||
      activeOriginalParts.findIndex((p) => p.id === originalPart.id) + 1 ||
      pIndex + 1;

    const partFormat = originalPart.format || tPart.format;

    if (tPart.action === 'create' || tPart.action === 'update') {
      if (!partFormat) return `Part ${displayPartNum} is missing a test format.`;

      if (partFormat !== 'F' && (!tPart.content || String(tPart.content).trim() === '')) {
        return `Part ${displayPartNum} is missing content.`;
      }
    }

    const originalQuestions = originalPart.questions || [];
    const activeQuestions = originalQuestions.filter((q) => q.action !== 'delete');
    const hasDeletedQuestion = originalQuestions.some((q) => q.action === 'delete');

    if (tPart.action === 'create' || hasDeletedQuestion) {
      if (activeQuestions.length === 0) {
        return `Part ${displayPartNum} must have at least one question.`;
      }
    }

    const tQuestions = tPart.questions || [];
    for (let qIndex = 0; qIndex < tQuestions.length; qIndex++) {
      const tQuestion = tQuestions[qIndex];

      if (tQuestion.action === 'delete') continue;

      const originalQuestion = originalQuestions.find((q) => q.id === tQuestion.id) || tQuestion;
      const displayQuestionNum =
        originalQuestion.question_number ||
        activeQuestions.findIndex((q) => q.id === originalQuestion.id) + 1;

      if (tQuestion.action === 'create' || tQuestion.action === 'update') {
        if (
          !['I', 'H'].includes(partFormat) &&
          (!tQuestion.content || String(tQuestion.content).trim() === '')
        ) {
          return `Part ${displayPartNum}, Question ${displayQuestionNum}: add the question content.`;
        }
      }

      const originalAnswers = originalQuestion.answers || [];
      const activeAnswers = originalAnswers.filter((a) => a.action !== 'delete');
      const hasDeletedAnswer = originalAnswers.some((a) => a.action === 'delete');

      const hasCorrectAnswerChanged = (tQuestion.answers || []).some(
        (tAns) =>
          tAns.action === 'update' && Object.prototype.hasOwnProperty.call(tAns, 'is_correct'),
      );

      if (['F', 'G', 'H'].includes(partFormat)) {
        if (tQuestion.action === 'create' || hasDeletedAnswer || hasCorrectAnswerChanged) {
          if (activeAnswers.length < 3) {
            return `Question ${displayQuestionNum} in Part ${displayPartNum} must have at least 3 answer options.`;
          }
        }
      }

      const tAnswers = tQuestion.answers || [];
      for (let aIndex = 0; aIndex < tAnswers.length; aIndex++) {
        const tAns = tAnswers[aIndex];

        if (tAns.action === 'delete') continue;

        if (tAns.action === 'create' || tAns.action === 'update') {
          // 1. Kiểm tra Option Label (Trừ I)
          if (
            partFormat !== 'I' &&
            (!tAns.option_label || String(tAns.option_label).trim() === '')
          ) {
            return `Part ${displayPartNum}, Question ${displayQuestionNum}: choose an option label (A, B, C...).`;
          }

          if (!tAns.answer_text || String(tAns.answer_text).trim() === '') {
            const isMultipleChoice = ['F', 'G', 'H'].includes(partFormat);
            const optionLabel = tAns.option_label ? ` (${tAns.option_label})` : '';

            return isMultipleChoice
              ? `Part ${displayPartNum}, Question ${displayQuestionNum}: fill in option${optionLabel}.`
              : `Part ${displayPartNum}, Question ${displayQuestionNum}: fill in the answer.`;
          }
        }
      }

      if (['F', 'G', 'H'].includes(partFormat)) {
        const hasCorrectAnswer = activeAnswers.some((a) => a.is_correct === true);
        if (!hasCorrectAnswer) {
          return `Part ${displayPartNum}, Question ${displayQuestionNum}: choose the correct answer.`;
        }
      }
    }
  }

  return null;
};

export const validateListeningPartUpdatePayload = (parts) => {
  const isEmptyText = (text) => {
    if (!text) return true;
    return String(text).trim() === '';
  };

  const formatPartMessage = (partName, message) => `Part ${partName}: ${message}`;
  const formatQuestionMessage = (partName, qNum, message) =>
    `Part ${partName}, Question ${qNum}: ${message}`;

  if (!parts || parts.length === 0) {
    return 'Test must have at least 1 part';
  }

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const partName = i + 1;
    const partType = part.type;

    // 1. Check score (for all types)
    const score = part.score ?? part.totalScore;
    const scoreValue = parseFloat(score);
    if (
      score === undefined ||
      score === null ||
      score === '' ||
      isNaN(scoreValue) ||
      scoreValue === 0
    ) {
      return formatPartMessage(partName, 'fill in the score');
    }
    if (scoreValue < 0) {
      return formatPartMessage(partName, 'score cannot be negative');
    }

    // 2. Check description (for all types)
    if (isEmptyText(part.description)) {
      return formatPartMessage(partName, 'fill in the description');
    }

    // 3. Check audio (for multichoice_images, format C multichoice_texts, fill_in_the_blanks, matching)
    if (['multichoice_images', 'fill_in_the_blanks', 'matching'].includes(partType)) {
      const hasAudio = part.audio?.file || part.audio?.url || part.audio?.name;
      if (!hasAudio) {
        return formatPartMessage(partName, 'upload the audio file');
      }
    } else if (partType === 'multichoice_texts') {
      // Format C: check part-level audio
      if (part.audioFormat === 'onetomany') {
        const hasAudio = part.audio?.file || part.audio?.url || part.audio?.name;
        if (!hasAudio) {
          return formatPartMessage(partName, 'upload the audio file');
        }
      }
    }

    // 4. Check content (only for fill_in_the_blanks)
    if (partType === 'fill_in_the_blanks' && isEmptyText(part.content)) {
      return formatPartMessage(partName, 'fill in the content');
    }

    // 5. Check questions exist
    if (!part.questions || part.questions.length === 0) {
      return formatPartMessage(partName, 'add at least one question');
    }

    // 6. Check each question
    for (let j = 0; j < part.questions.length; j++) {
      const q = part.questions[j];
      const qNum = j + 1;

      if (partType === 'multichoice_images') {
        if (isEmptyText(q.text)) {
          return formatQuestionMessage(partName, qNum, 'fill in the question text');
        }

        if (!q.answers || q.answers.length < 2) {
          return formatQuestionMessage(partName, qNum, 'add at least 2 answer options');
        }

        for (let k = 0; k < q.answers.length; k++) {
          const ans = q.answers[k];
          const hasImage = ans.image?.file || ans.image?.url || ans.image?.name;
          if (!hasImage) {
            return formatQuestionMessage(partName, qNum, `upload image for option ${k + 1}`);
          }
        }

        if (q.correctIndex === null || q.correctIndex === undefined) {
          return formatQuestionMessage(partName, qNum, 'select the correct answer');
        }
      } else if (partType === 'multichoice_texts') {
        if (isEmptyText(q.text)) {
          return formatQuestionMessage(partName, qNum, 'fill in the question text');
        }

        // Format B: check question-level audio
        if (part.audioFormat === 'onetoone') {
          const hasAudio = q.audio?.file || q.audio?.url || q.audio?.name;
          if (!hasAudio) {
            return formatQuestionMessage(partName, qNum, 'upload the audio file');
          }
        }

        if (!q.answers || q.answers.length < 2) {
          return formatQuestionMessage(partName, qNum, 'add at least 2 answer options');
        }

        for (let k = 0; k < q.answers.length; k++) {
          const ans = q.answers[k];
          if (isEmptyText(ans.text)) {
            return formatQuestionMessage(partName, qNum, `fill in text for option ${k + 1}`);
          }
        }

        if (q.correctIndex === null || q.correctIndex === undefined) {
          return formatQuestionMessage(partName, qNum, 'select the correct answer');
        }
      } else if (partType === 'fill_in_the_blanks') {
        if (!q.answers || q.answers.length === 0) {
          return formatQuestionMessage(partName, qNum, 'add at least one answer');
        }

        for (let k = 0; k < q.answers.length; k++) {
          const ans = q.answers[k];
          if (isEmptyText(ans.text)) {
            return formatQuestionMessage(partName, qNum, `fill in answer ${k + 1}`);
          }
        }
      } else if (partType === 'matching') {
        if (isEmptyText(q.text)) {
          return formatQuestionMessage(partName, qNum, 'fill in the question text');
        }

        if (!q.selectedAnswerId) {
          return formatQuestionMessage(partName, qNum, 'select the matching answer');
        }

        if (isEmptyText(q.answer?.text)) {
          return formatQuestionMessage(partName, qNum, 'fill in the answer text');
        }
      }
    }

    // 7. Check matching answers (only for matching type)
    if (partType === 'matching') {
      if (!part.answers || part.answers.length === 0) {
        return formatPartMessage(partName, 'add at least one matching answer');
      }

      for (let k = 0; k < part.answers.length; k++) {
        const ans = part.answers[k];
        if (isEmptyText(ans.text)) {
          return formatQuestionMessage(partName, k + 1, 'fill in the matching answer');
        }
      }
    }
  }

  return null;
};

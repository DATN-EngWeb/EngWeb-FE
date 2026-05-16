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

const getPartScoreMeta = (part) => {
  const rawScore = part?.score ?? part?.totalScore;
  const scoreValue = parseFloat(rawScore);
  return { rawScore, scoreValue };
};

// Validate MultiChoiceImagePart
export const validateMultiChoiceImagePart = (part) => {
  const errors = { questions: {} };

  const { rawScore, scoreValue } = getPartScoreMeta(part);
  if (
    rawScore === undefined ||
    rawScore === null ||
    rawScore === '' ||
    isNaN(scoreValue) ||
    scoreValue === 0
  ) {
    errors.totalScore = true;
  } else if (scoreValue < 0) {
    errors.totalScoreNegative = true;
  }
  if (!part.description?.trim()) errors.description = true;
  const hasAudio = part.audio?.file || part.audio?.url || part.audio?.name;
  if (!hasAudio) errors.audio = true;

  if (!part.questions || part.questions.length === 0) {
    errors.noQuestions = true;
  }

  part.questions?.forEach((q, qIdx) => {
    const qErrors = {};

    if (!q.text?.trim()) qErrors.text = true;
    if (q.correctIndex === null || q.correctIndex === undefined) qErrors.correctIndex = true;

    if (!q.answers || q.answers.length < 2) {
      qErrors.answers = true;
    } else {
      qErrors.answerImages = [];
      q.answers.forEach((ans) => {
        const hasImage = ans.image?.file || ans.image?.url || ans.image?.name;
        qErrors.answerImages.push(!hasImage);
      });
      if (!qErrors.answerImages.some(Boolean)) delete qErrors.answerImages;
    }

    if (Object.keys(qErrors).length > 0) errors.questions[qIdx] = qErrors;
  });

  return Object.keys(errors.questions || {}).length > 0 ||
    errors.noQuestions ||
    errors.totalScore ||
    errors.totalScoreNegative ||
    errors.description ||
    errors.audio
    ? errors
    : {};
};

// Validate MultiChoiceTextPart
export const validateMultiChoiceTextPart = (part) => {
  const errors = { questions: {} };

  const { rawScore, scoreValue } = getPartScoreMeta(part);
  if (
    rawScore === undefined ||
    rawScore === null ||
    rawScore === '' ||
    isNaN(scoreValue) ||
    scoreValue === 0
  ) {
    errors.totalScore = true;
  } else if (scoreValue < 0) {
    errors.totalScoreNegative = true;
  }
  if (!part.description?.trim()) errors.description = true;

  if (!part.questions || part.questions.length === 0) {
    errors.noQuestions = true;
  }

  // Format C: check part-level audio
  if (part.audioFormat === 'onetomany') {
    const hasAudio = part.audio?.file || part.audio?.url || part.audio?.name;
    if (!hasAudio) errors.partAudio = true;
  }

  part.questions?.forEach((q, qIdx) => {
    const qErrors = {};

    if (!q.text?.trim()) qErrors.text = true;

    // Format B: check question-level audio
    if (part.audioFormat === 'onetoone') {
      const hasAudio = q.audio?.file || q.audio?.url || q.audio?.name;
      if (!hasAudio) qErrors.audio = true;
    }

    if (q.correctIndex === null || q.correctIndex === undefined) qErrors.correctIndex = true;

    if (!q.answers || q.answers.length < 2) {
      qErrors.answers = true;
    } else {
      qErrors.answerTexts = [];
      q.answers.forEach((ans) => {
        qErrors.answerTexts.push(!ans.text?.trim());
      });
      if (!qErrors.answerTexts.some(Boolean)) delete qErrors.answerTexts;
    }

    if (Object.keys(qErrors).length > 0) errors.questions[qIdx] = qErrors;
  });

  return Object.keys(errors.questions || {}).length > 0 ||
    errors.partAudio ||
    errors.noQuestions ||
    errors.totalScore ||
    errors.totalScoreNegative ||
    errors.description
    ? errors
    : {};
};

// Validate FillInTheBlankPart
export const validateFillInTheBlankPart = (part) => {
  const errors = {};

  const { rawScore, scoreValue } = getPartScoreMeta(part);
  if (
    rawScore === undefined ||
    rawScore === null ||
    rawScore === '' ||
    isNaN(scoreValue) ||
    scoreValue === 0
  ) {
    errors.totalScore = true;
  } else if (scoreValue < 0) {
    errors.totalScoreNegative = true;
  }
  const hasAudio = part.audio?.file || part.audio?.url || part.audio?.name;
  if (!hasAudio) errors.audio = true;
  if (!part.description?.trim()) errors.description = true;

  if (!part.answers || part.answers.length === 0) {
    errors.noAnswers = true;
  } else {
    errors.answers = [];
    part.answers.forEach((ans) => {
      errors.answers.push(!ans.text?.trim());
    });
    if (!errors.answers.some(Boolean)) delete errors.answers;
  }

  return Object.keys(errors).length > 0 ? errors : {};
};

// Validate MatchingPart
export const validateMatchingPart = (part) => {
  const errors = {};

  const { rawScore, scoreValue } = getPartScoreMeta(part);
  if (
    rawScore === undefined ||
    rawScore === null ||
    rawScore === '' ||
    isNaN(scoreValue) ||
    scoreValue === 0
  ) {
    errors.totalScore = true;
  } else if (scoreValue < 0) {
    errors.totalScoreNegative = true;
  }
  const hasAudio = part.audio?.file || part.audio?.url || part.audio?.name;
  if (!hasAudio) errors.audio = true;
  if (!part.description?.trim()) errors.description = true;

  if (!part.questions || part.questions.length === 0) {
    errors.noQuestions = true;
  } else {
    errors.questions = {};
    part.questions.forEach((q, qIdx) => {
      const qErrors = {};
      if (!q.text?.trim()) qErrors.text = true;
      if (!q.selectedAnswerId) qErrors.selectedAnswerId = true;
      if (Object.keys(qErrors).length > 0) errors.questions[qIdx] = qErrors;
    });
    if (Object.keys(errors.questions).length === 0) delete errors.questions;
  }

  if (!part.answers || part.answers.length === 0) {
    errors.noAnswers = true;
  } else {
    errors.answers = [];
    part.answers.forEach((ans) => {
      errors.answers.push(!ans.text?.trim());
    });
    if (!errors.answers.some(Boolean)) delete errors.answers;
  }

  return Object.keys(errors).length > 0 ? errors : {};
};

// Main validation
export const validateTest = (basicInfo, parts) => {
  const errors = {
    basicInfo: validateBasicInfo(basicInfo),
    parts: [],
  };

  if (!parts || parts.length === 0) {
    errors.noParts = true;
    return errors;
  }

  parts.forEach((part) => {
    if (!part.type) {
      errors.parts.push({ noType: true });
      return;
    }

    let partErrors = {};
    switch (part.type) {
      case 'multichoice_images':
        partErrors = validateMultiChoiceImagePart(part);
        break;
      case 'multichoice_texts':
        partErrors = validateMultiChoiceTextPart(part);
        break;
      case 'fill_in_the_blanks':
        partErrors = validateFillInTheBlankPart(part);
        break;
      case 'matching':
        partErrors = validateMatchingPart(part);
        break;
    }

    errors.parts.push(Object.keys(partErrors).length > 0 ? partErrors : null);
  });

  const hasErrors =
    Object.keys(errors.basicInfo).length > 0 || errors.noParts || errors.parts.some(Boolean);

  return hasErrors ? errors : null;
};

// Get user-friendly error message
export const getValidationErrorMessage = (errors) => {
  if (!errors) return null;

  // Always show Basic Information errors first.
  if (errors.basicInfo?.testName) return 'Please enter the test title';
  if (errors.basicInfo?.level) return 'Please select a level';
  if (errors.basicInfo?.time) return 'Please enter a valid test time';
  if (errors.basicInfo?.timeNegative) return 'Test time cannot be negative';
  if (errors.basicInfo?.description) return 'Please enter the test description';

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

export const validateReadingPartUpdatePayload = (originalParts) => {
  // Nếu payload trống hoặc không hợp lệ
  if (!originalParts || !Array.isArray(originalParts) || originalParts.length === 0) {
    return null;
  }

  // Lọc ra các Part đang active (không bị xóa)
  const activeParts = originalParts.filter((p) => p.action !== 'delete');

  if (activeParts.length === 0) {
    return 'The test must have at least one active part.';
  }

  // Bắt đầu duyệt từng Part active
  for (let pIndex = 0; pIndex < activeParts.length; pIndex++) {
    const part = activeParts[pIndex];
    const displayPartNum = part.order || pIndex + 1;
    const partFormat = part.format;

    // 1. Validate Điểm (Score)
    const score = part.scoreForEachQuestion;
    if (
      score === undefined ||
      score === null ||
      score === '' ||
      isNaN(score) ||
      Number(score) === 0
    ) {
      return `Score for each question in Part ${displayPartNum} has not been filled.`;
    }

    // 2. Validate Format & Content của Part
    if (!partFormat) {
      return `Part ${displayPartNum} is missing a test format.`;
    }

    // Format 'F' (Multiple choice - short text): Không bắt buộc nhập content ở cấp độ Part
    if (partFormat !== 'F' && (!part.content || String(part.content).trim() === '')) {
      return `Part ${displayPartNum} is missing content.`;
    }

    // 3. Validate Questions
    const questions = part.questions || [];
    const activeQuestions = questions.filter((q) => q.action !== 'delete');

    if (activeQuestions.length === 0) {
      return `Part ${displayPartNum} must have at least one question.`;
    }

    for (let qIndex = 0; qIndex < activeQuestions.length; qIndex++) {
      const question = activeQuestions[qIndex];
      const displayQuestionNum = question.question_number || qIndex + 1;

      // Bắt buộc nhập content ở cấp độ Question (TRỪ format 'I')
      if (partFormat !== 'I' && (!question.content || String(question.content).trim() === '')) {
        return `Part ${displayPartNum}, Question ${displayQuestionNum}: add the question content.`;
      }

      // 4. Validate Answers
      const answers = question.answers || [];
      const activeAnswers = answers.filter((a) => a.action !== 'delete');
      const isMultipleChoice = ['F', 'G', 'H'].includes(partFormat);

      // Rule riêng cho Trắc nghiệm (F, G, H): Tối thiểu 3 đáp án & có 1 đáp án đúng
      if (isMultipleChoice) {
        if (activeAnswers.length < 3) {
          return `Question ${displayQuestionNum} in Part ${displayPartNum} must have at least 3 answer options.`;
        }

        const hasCorrectAnswer = activeAnswers.some((a) => a.is_correct === true);
        if (!hasCorrectAnswer) {
          return `Part ${displayPartNum}, Question ${displayQuestionNum}: choose the correct answer.`;
        }
      }

      // Kiểm tra chi tiết từng đáp án active
      for (let aIndex = 0; aIndex < activeAnswers.length; aIndex++) {
        const answer = activeAnswers[aIndex];
        const optionLabel = answer.option_label;
        const answerText = answer.answer_text;

        // Format 'I' (Fill blank - text): Không bắt buộc có option label (A, B, C...)
        if (partFormat !== 'I' && (!optionLabel || String(optionLabel).trim() === '')) {
          return `Part ${displayPartNum}, Question ${displayQuestionNum}: choose an option label (A, B, C...).`;
        }

        // Format 'J' (Matching): Không bắt buộc nhập answer_text ở các option
        if (partFormat !== 'J' && (!answerText || String(answerText).trim() === '')) {
          const optionLabelDisplay = optionLabel ? ` (${optionLabel})` : '';

          // Lời cảnh báo trả ra khác nhau dựa trên định dạng
          return isMultipleChoice
            ? `Part ${displayPartNum}, Question ${displayQuestionNum}: fill in option${optionLabelDisplay}.`
            : `Part ${displayPartNum}, Question ${displayQuestionNum}: fill in the answer.`;
        }
      }
    }
  }

  return null;
};

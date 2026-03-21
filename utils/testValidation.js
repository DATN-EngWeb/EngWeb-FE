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
    if (!q.explanation?.trim()) qErrors.explanation = true;
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
    if (!q.explanation?.trim()) qErrors.explanation = true;

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
    errors.answerExplanations = [];
    part.answers.forEach((ans) => {
      errors.answers.push(!ans.text?.trim());
      errors.answerExplanations.push(!ans.explanation?.trim());
    });
    if (!errors.answers.some(Boolean)) delete errors.answers;
    if (!errors.answerExplanations.some(Boolean)) delete errors.answerExplanations;
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
      if (!q.explanation?.trim()) qErrors.explanation = true;
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

  if (errors.basicInfo?.timeNegative) return 'Test time cannot be negative';
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
      (p) =>
        p?.questions && Object.keys(p.questions).some((qIdx) => p.questions[qIdx]?.explanation),
    )
  )
    return 'All question explanations must be filled';
  if (errors.parts?.some((p) => p?.answerExplanations?.some(Boolean)))
    return 'All answer explanations must be filled';
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

  if (!parts || parts.length === 0) {
    return 'The test has no parts.';
  }

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const partName = `Part ${part.order || i + 1}`;
    const format = part.format;

    if (format === 'F') {
      if (isEmptyText(part.description)) {
        return `Error in ${partName}: Description is required.`;
      }
    }

    if (['G', 'H', 'I', 'J'].includes(format)) {
      if (isEmptyText(part.content)) {
        return `Error in ${partName}: Passage content is required.`;
      }
    }

    if (!part.questions || part.questions.length === 0) {
      return `Error in ${partName}: No questions have been created.`;
    }

    for (let j = 0; j < part.questions.length; j++) {
      const q = part.questions[j];
      const qNum = q.question_number || j + 1;

      if (['F', 'G', 'H', 'I', 'J'].includes(format)) {
        if (isEmptyText(q.explanation)) {
          return `Error in ${partName}, Question ${qNum}: Explanation is required.`;
        }
      }

      if (!q.answers || q.answers.length === 0) {
        return `Error in ${partName}, Question ${qNum}: No answers provided.`;
      }

      if (['F', 'G', 'H'].includes(format)) {
        if (q.answers.length < 3) {
          return `Error in ${partName}, Question ${qNum}: There must be at least 3 answers.`;
        }
      }

      const hasCorrectAnswer = q.answers.some((ans) => ans.is_correct === true);
      if (!hasCorrectAnswer) {
        return `Error in ${partName}, Question ${qNum}: At least one correct answer must be selected.`;
      }

      if (['F', 'G', 'H'].includes(format)) {
        if (isEmptyText(q.content)) {
          return `Error in ${partName}, Question ${qNum}: Question content cannot be empty.`;
        }
      }

      if (['F', 'G', 'H', 'J'].includes(format)) {
        for (let k = 0; k < q.answers.length; k++) {
          const ans = q.answers[k];
          if (isEmptyText(ans.answer_text)) {
            const label = ans.option_label ? `(${ans.option_label})` : `Option ${k + 1}`;
            return `Error in ${partName}, Question ${qNum}: Content for answer ${label} cannot be empty.`;
          }
        }
      }

      if (format === 'I') {
        const correctAns = q.answers.find((a) => a.is_correct);
        if (correctAns && isEmptyText(correctAns.answer_text)) {
          return `Error in ${partName}, Question ${qNum}: The correct answer (keyword) cannot be empty.`;
        }
      }

      const parsedScore = parseInt(q.score, 10);
      if (isNaN(parsedScore) || Number(q.score) !== parsedScore || parsedScore <= 0) {
        return `Error in ${partName}, Question ${qNum}: Score must be a positive integer greater than 0.`;
      }
    }
  }
  return null;
};

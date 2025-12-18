export const mapMultiChoiceImagePart = (part, partIndex) => ({
  part_type: 'multichoice_images',
  index: partIndex + 1,
  total_score: Number(part.totalScore) || 0,
  time: part.time || '00:00',
  description: part.description || '',

  audio_key: part.audio ? `audio_part_${partIndex}` : null,

  questions: (part.questions || []).map((q, qIndex) => ({
    index: qIndex + 1,
    text: q.text,
    correct_answer: q.correctIndex + 1,

    answers: q.answers.map((a, aIndex) => ({
      label: a.label,
      image_key: a.image ? `img_${partIndex}_${qIndex}_${aIndex}` : null,
    })),
  })),
});

export const mapPartByType = (part, index) => {
  switch (part.type) {
    case 'multichoice_images':
      return mapMultiChoiceImagePart(part, index);

    default:
      throw new Error(`Unsupported part type: ${part.type}`);
  }
};

export const buildTestPayload = ({ basicInfo, parts, status }) => {
  return {
    test_name: basicInfo.testName.trim(),
    level: basicInfo.level,
    status,
    parts: parts.filter((p) => p.type).map((part, index) => mapPartByType(part, index)),
  };
};

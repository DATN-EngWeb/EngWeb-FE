export const getListeningTestTypeLabel = (type) => {
  switch (type) {
    case 'A':
    case 'multichoice_images':
      return 'Multiple choice images';
    case 'B':
      return 'Multiple Choices Text (1 audio/1 question)';
    case 'C':
      return 'Multiple Choices Text (1 audio/many questions)';
    case 'D':
    case 'fill_in_the_blanks':
      return 'Fill in the blank';
    case 'E':
    case 'matching':
      return 'Matching';
    case 'multichoice_texts':
      return 'Multiple Choices Text';
    default:
      return 'Unknown Test Type';
  }
};

export const formatTimeFromMinutes = (minutes) => {
  if (!minutes || isNaN(minutes)) return '00:00';
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

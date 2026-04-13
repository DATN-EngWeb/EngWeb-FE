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

export const minutesToHour = (minutes) => {
  if (!minutes || isNaN(minutes)) return '0';
  if (minutes > 120) {
    return (minutes / 60).toFixed(1);
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

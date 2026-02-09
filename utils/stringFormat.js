export const getListeningTestTypeLabel = (type) => {
  switch (type?.toUpperCase()) {
    case 'A':
      return 'Multiple choice images';
    case 'B':
    case 'C':
      return 'Listening - Multiple choice text';
    case 'D':
      return 'Fill in the blank';
    case 'E':
      return 'Matching';
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

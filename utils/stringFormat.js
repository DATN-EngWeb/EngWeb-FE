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

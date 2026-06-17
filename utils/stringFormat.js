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

// Định dạng: 25/12/2023
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Định dạng: 18:00 24/05/2026
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const timePart = new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(date);

  const datePart = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(date);

  return `${timePart} ${datePart}`;
};

// Định dạng: Dec 25, 2023
export const formatDateFull = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
};

// 3600 --> 1.0
export const secondsToHours = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0';
  return (seconds / 3600).toFixed(1);
};

// 60 --> 1.0
export const secondsToMinutesValue = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0';
  return (seconds / 60).toFixed(1);
};

export const cleanBase64Images = (htmlString) => {
  if (!htmlString || typeof htmlString !== 'string') return htmlString;
  return htmlString.replace(/src="data:image\/[^"]+"/gi, (match) =>
    match.replace(/[\r\n\s]+/g, ''),
  );
};

/**
 * Validate productive test (speaking/writing) data before submission
 * Returns first error message or null if valid
 */
export const validateProductiveTestData = (testData, settings, question) => {
  // Basic Information validation
  if (!testData.testName || String(testData.testName).trim() === '') {
    return 'Test title is required';
  }
  if (!testData.level || String(testData.level).trim() === '') {
    return 'Level is required';
  }
  if (!testData.format || String(testData.format).trim() === '') {
    return 'Format is required';
  }
  if (!testData.topics || String(testData.topics).trim() === '') {
    return 'Topics is required';
  }
  if (!settings.timeLimit || Number(settings.timeLimit) <= 0) {
    return 'Time limit must be greater than 0';
  }

  // Question content validation
  if (
    !question.description ||
    String(question.description).trim() === '' ||
    String(question.description).trim() === '<p><br></p>' ||
    String(question.description).trim() === '<p></p>'
  ) {
    return 'Description test cannot be empty';
  }

  // Writing specific: minWords validation
  if (testData.skill === 'W') {
    if (!settings.minWords || Number(settings.minWords) <= 0) {
      return 'Minimum words must be greater than 0';
    }
  }

  return null;
};

/**
 * Parse API error response and extract user-friendly message
 */
export const parseApiError = (error) => {
  if (!error) return 'An error occurred';

  // If error has a custom message already set by handleResponse
  if (error.message) {
    return error.message;
  }

  // If error.data contains validation errors
  if (error.data) {
    if (typeof error.data === 'object') {
      // Try to extract field-specific errors
      const fieldErrors = [];
      Object.entries(error.data).forEach(([, messages]) => {
        if (Array.isArray(messages)) {
          fieldErrors.push(...messages);
        } else if (typeof messages === 'string') {
          fieldErrors.push(messages);
        }
      });
      if (fieldErrors.length > 0) {
        return fieldErrors.join(', ');
      }
    }
  }

  return 'Submit failed. Please check your input and try again.';
};

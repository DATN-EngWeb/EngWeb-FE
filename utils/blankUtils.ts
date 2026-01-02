/**
 * Utility functions for handling blank elements in CKEditor content
*/

export interface BlankData {
  id: number;
  answerKey?: string;
}

/**
 * Extract all blank elements from HTML content
 * @param htmlContent - The HTML content from CKEditor
 * @returns Array of blank data with IDs
*/
export function extractBlanks(htmlContent: string): BlankData[] {
  if (typeof window === "undefined") {
      return [];
  }
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const blanks: BlankData[] = [];
  
  const blankElements = doc.querySelectorAll(".blank-element");
  blankElements.forEach((element) => {
      const id = element.getAttribute("data-blank-id");
      if (id) {
          blanks.push({
              id: parseInt(id, 10),
            });
        }
    });
    
    return blanks.sort((a, b) => a.id - b.id);
}

/**
 * Extract blank IDs from content (get only the IDs)
 * @param htmlContent - The HTML content with blanks
 * @returns Array of blank IDs
 */
export function getBlankIds(htmlContent: string): number[] {
  const blanks = extractBlanks(htmlContent);
  return blanks.map((b) => b.id);
}

/**
 * Replace blank elements with provided answers
 * @param htmlContent - The HTML content with blanks
 * @param answers - Object mapping blank ID to answer text
 * @returns HTML with blanks replaced by answers
 */
export function fillBlanks(
  htmlContent: string,
  answers: { [blankId: number]: string }
): string {
  if (typeof window === "undefined") {
    return htmlContent;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");

  const blankElements = doc.querySelectorAll(".blank-element");
  blankElements.forEach((element) => {
    const id = element.getAttribute("data-blank-id");
    if (id && answers[parseInt(id, 10)]) {
      const answer = answers[parseInt(id, 10)];
      // Create a span with the answer
      const answerSpan = doc.createElement("span");
      answerSpan.className = "blank-answer";
      answerSpan.textContent = answer;
      element.replaceWith(answerSpan);
    }
  });

  return doc.body.innerHTML;
}

/**
 * Get raw content without blank styling (raw elements for storage)
 * Converts visual blanks to <blank id="X"> tags
 * @param htmlContent - The HTML content from CKEditor
 * @returns HTML with blank-element spans converted to blank tags
 */
export function convertBlanksToRawFormat(htmlContent: string): string {
  if (typeof window === "undefined") {
    return htmlContent;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");

  const blankElements = doc.querySelectorAll(".blank-element");
  blankElements.forEach((element) => {
    const id = element.getAttribute("data-blank-id");
    if (id) {
      // Create a custom blank tag
      const blankTag = doc.createElement("blank");
      blankTag.setAttribute("id", id);
      blankTag.textContent = ""; // No text content in blank tag
      element.replaceWith(blankTag);
    }
  });

  return doc.body.innerHTML;
}

/**
 * Convert raw format back to visual format
 * Converts <blank id="X"> tags to visual blank elements
 * @param rawContent - Content with <blank> tags
 * @returns HTML with blank tags converted to visual elements
 */
export function convertBlanksToVisualFormat(rawContent: string): string {
  if (typeof window === "undefined") {
    return rawContent;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawContent, "text/html");

  // CKEditor may use different approaches, so we handle both cases
  const blankTags = doc.querySelectorAll("blank");
  blankTags.forEach((element) => {
    const id = element.getAttribute("id");
    if (id) {
      // Create visual blank element
      const span = doc.createElement("span");
      span.className = "blank-element";
      span.setAttribute("data-blank-id", id);
      span.textContent = ""; // Content will be rendered by CSS
      element.replaceWith(span);
    }
  });

  return doc.body.innerHTML;
}

/**
 * Check if content has any blanks
 * @param htmlContent - The HTML content
 * @returns True if content contains blank elements
 */
export function hasBlanks(htmlContent: string): boolean {
  return extractBlanks(htmlContent).length > 0;
}

/**
 * Generate a blank answer template
 * @param blankIds - Array of blank IDs
 * @returns Object with blank IDs as keys and empty strings as values
 */
export function generateBlankAnswerTemplate(blankIds: number[]): {
  [key: number]: string;
} {
  return blankIds.reduce((acc, id) => {
    acc[id] = "";
    return acc;
  }, {} as { [key: number]: string });
}

/**
 * Sanitize and validate blank answers
 * @param answers - Raw answers object
 * @param expectedIds - Expected blank IDs
 * @returns Sanitized answers object with only valid IDs
 */
export function sanitizeBlankAnswers(
  answers: { [key: string]: string },
  expectedIds: number[]
): { [key: number]: string } {
  const result: { [key: number]: string } = {};

  expectedIds.forEach((id) => {
    const key = String(id);
    if (answers[key]) {
      result[id] = String(answers[key]).trim();
    } else {
      result[id] = "";
    }
  });

  return result;
}

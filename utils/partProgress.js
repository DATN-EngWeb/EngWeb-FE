// utils/partProgress.js

/**
 * Tính progress cho một Part trong bài Listening.
 * @param {object}     part         - Part object từ receptiveParts (có .receptive_questions)
 * @param {object}     allAnswers   - allAnswers state từ ListeningTestContent
 * @param {Set<number>} visitedParts - Set các index đã ghé thăm
 * @param {number}     partIndex    - Index của Part này
 * @returns {{ status: 'default'|'in-progress'|'completed', unanswered: number, total: number }}
 */
export function getListeningPartProgress(part, allAnswers, visitedParts, partIndex) {
  if (!visitedParts.has(partIndex)) {
    return { status: 'default', unanswered: 0, total: 0 };
  }

  const totalQ = part.receptive_questions?.length ?? 0;
  const partAnswers = allAnswers[part.id] ?? {};

  const answeredQ = Object.values(partAnswers).filter(
    (v) =>
      v !== null &&
      v !== undefined &&
      (typeof v === 'string' ? v.trim() !== '' : true) &&
      (Array.isArray(v) ? v.length > 0 : true),
  ).length;

  const unanswered = totalQ - answeredQ;
  return {
    status: unanswered === 0 ? 'completed' : 'in-progress',
    unanswered,
    total: totalQ,
  };
}

/**
 * Tính progress cho một Part trong bài Reading.
 * @param {object}     part         - Part object từ testData.parts (có .data.questions = [{id,...}])
 * @param {object}     answers      - answers state từ ReadingTestContent (flat object)
 * @param {Set<number>} visitedParts - Set các index đã ghé thăm
 * @param {number}     partIndex    - Index của Part này
 * @returns {{ status: 'default'|'in-progress'|'completed', unanswered: number, total: number }}
 */
export function getReadingPartProgress(part, answers, visitedParts, partIndex) {
  if (!visitedParts.has(partIndex)) {
    return { status: 'default', unanswered: 0, total: 0 };
  }

  const questions = part.data?.questions ?? [];
  const totalQ = questions.length;

  const answeredQ = questions.filter((q) => {
    const v = answers[q.id];
    return (
      v !== null &&
      v !== undefined &&
      (typeof v === 'string' ? v.trim() !== '' : true) &&
      (Array.isArray(v) ? v.length > 0 : true)
    );
  }).length;

  const unanswered = totalQ - answeredQ;
  return {
    status: unanswered === 0 ? 'completed' : 'in-progress',
    unanswered,
    total: totalQ,
  };
}

/**
 * Tính toán mảng các tab cần hiển thị, hỗ trợ pagination (dấu ...).
 * @param {number} current - Index của tab đang active (0-based)
 * @param {number} total - Tổng số tab
 * @returns {Array<number|string>} Mảng chứa các index hoặc chuỗi '...'
 */
export function getVisibleTabs(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i);
  }

  const res = [];
  res.push(0);

  if (current <= 2) {
    res.push(1, 2, 3, '...', total - 1);
  } else if (current >= total - 3) {
    res.push('...', total - 4, total - 3, total - 2, total - 1);
  } else {
    res.push('...', current - 1, current, current + 1, '...', total - 1);
  }

  return res;
}

const getAudioObj = (url) => (url ? { name: url.split('/').pop(), url } : null);

const transformAnswers = (answers, type) =>
  answers.map((a, i) => ({
    id: `${type}-${a.id}-${i}`,
    label: a.option_label || String.fromCharCode(65 + i),
    ...(type === 'image'
      ? { image: getAudioObj(a.resources?.image) }
      : { text: a.answer_text || '' }),
    is_correct: a.is_correct,
  }));

export const transformApiResponseToParts = (apiData) => {
  if (!apiData?.receptive_test?.receptive_parts) return [];

  const formatMap = {
    A: 'multichoice_images',
    B: 'multichoice_texts',
    C: 'multichoice_texts',
    D: 'fill_in_the_blanks',
    E: 'matching',
  };

  return apiData.receptive_test.receptive_parts
    .map((part) => {
      const type = formatMap[part.format];
      if (!type) return null;

      const base = {
        id: crypto.randomUUID(),
        type,
        order: part.order,
        description: part.description || '',
        totalScore: part.score,
      };

      if (type === 'multichoice_images') {
        return {
          ...base,
          audio: getAudioObj(part.resources?.audio),
          questions: (part.receptive_questions || []).map((q, i) => {
            const answers = transformAnswers(q.receptive_answers, 'image');
            return {
              id: q.id,
              question_number: q.question_number || i + 1,
              text: q.content || '',
              explanation: q.explanation || '',
              answers,
              correctIndex: answers.findIndex((a) => a.is_correct),
            };
          }),
        };
      }

      if (type === 'multichoice_texts') {
        return {
          ...base,
          audioFormat: part.format === 'C' ? 'onetomany' : 'onetoone',
          ...(part.format === 'C' && {
            audio: getAudioObj(part.resources?.audio),
            _contentUrl: part.content?.startsWith('http') ? part.content : null,
          }),
          questions: (part.receptive_questions || []).map((q, i) => {
            const answers = transformAnswers(q.receptive_answers, 'text');
            return {
              id: q.id,
              question_number: q.question_number || i + 1,
              text: q.content || '',
              explanation: q.explanation || '',
              answers,
              correctIndex: answers.findIndex((a) => a.is_correct),
              ...(part.format === 'B' &&
                q.resources?.audio && { audio: getAudioObj(q.resources.audio) }),
            };
          }),
        };
      }

      if (type === 'fill_in_the_blanks') {
        return {
          ...base,
          audio: getAudioObj(part.resources?.audio),
          _contentUrl: part.content?.startsWith('http') ? part.content : null,
          answers: (part.receptive_questions || []).map((q) => ({
            id: `blank-${q.id}`,
            text: q.receptive_answers?.[0]?.answer_text || '',
            explanation: q.explanation || '',
          })),
          questions: (part.receptive_questions || []).map((q, i) => ({
            id: q.id,
            question_number: q.question_number || i + 1,
            text: q.content || '',
            explanation: q.explanation || '',
          })),
        };
      }

      if (type === 'matching') {
        const ansMap = new Map();
        (part.receptive_questions || []).forEach((q) =>
          q.receptive_answers?.forEach(
            (a) =>
              !ansMap.has(a.id) &&
              ansMap.set(a.id, { id: `ans-${a.id}`, text: a.answer_text || '' }),
          ),
        );

        return {
          ...base,
          audio: getAudioObj(part.resources?.audio),
          questions: (part.receptive_questions || []).map((q, i) => ({
            id: q.id,
            question_number: q.question_number || i + 1,
            text: q.content || '',
            explanation: q.explanation || '',
            selectedAnswerId: q.receptive_answers?.[0] ? `ans-${q.receptive_answers[0].id}` : null,
          })),
          answers: Array.from(ansMap.values()),
        };
      }

      return null;
    })
    .filter(Boolean);
};

export const collectFiles = (parts) => {
  const files = [];

  parts.forEach((part, partIdx) => {
    if (!part.type) return;

    if (part.audio?.file) {
      files.push({
        filename: part.audio.file.name,
        file: part.audio.file,
        fileSize: part.audio.file.size,
        mimeType: part.audio.file.type,
        partOrder: partIdx + 1,
      });
    }

    part.questions?.forEach((q) => {
      if (q.audio?.file) {
        files.push({
          filename: q.audio.file.name,
          file: q.audio.file,
          fileSize: q.audio.file.size,
          mimeType: q.audio.file.type,
          partOrder: partIdx + 1,
        });
      }

      q.answers?.forEach((ans) => {
        if (ans.image?.file) {
          files.push({
            filename: ans.image.file.name,
            file: ans.image.file,
            fileSize: ans.image.file.size,
            mimeType: ans.image.file.type,
            partOrder: partIdx + 1,
          });
        }
      });
    });
    const order = partIdx + 1;
    if (part?.content && typeof part.content === 'string' && part.content.trim().length > 0) {
      const filename = `part${order}_content.html`;
      const file = new File([part.content], filename, { type: 'text/html' });
      files.push({
        filename,
        file,
        fileSize: file.size,
        mimeType: 'text/html',
        partOrder: order,
      });
    }
  });

  return files;
};

export const transformPartsForSubmitWithUrls = (parts, urlMap) => {
  const resolve = (name) => {
    if (!name) return '';
    return urlMap[name] || name;
  };

  return parts
    .filter((p) => p.type)
    .map((part, index) => {
      const order = index + 1;

      const commonAudioName = resolve(part.audio?.file?.name || part.audio?.name);

      if (part.type === 'multichoice_images') {
        return {
          order,
          format: 'A',
          description: part.description || '',
          resources: { audio: commonAudioName },
          questions: (part.questions || []).map((q, qIdx) => ({
            question_number: q.question_number || qIdx + 1,
            content: q.text || '',
            explanation: q.explanation || '',
            score: parseFloat(part.totalScore) || 0,
            answers: (q.answers || []).map((ans, aIdx) => ({
              option_label: ans.option_label || String.fromCharCode(65 + aIdx),
              is_correct: q.correctIndex === aIdx || ans.is_correct || false,
              resources: {
                image: resolve(ans.image?.file?.name || ans.image?.name),
              },
            })),
          })),
        };
      }

      if (part.type === 'multichoice_texts') {
        const isOneToOne = part.audioFormat === 'onetoone';
        return {
          order,
          format: isOneToOne ? 'B' : 'C',
          description: part.description || '',
          content: !isOneToOne && part.content ? resolve(`part${order}_content.html`) : undefined,
          resources: isOneToOne
            ? undefined
            : {
                audio: commonAudioName,
              },
          questions: (part.questions || []).map((q, qIdx) => ({
            question_number: q.question_number || qIdx + 1,
            content: q.text || '',
            explanation: q.explanation || '',
            score: parseFloat(part.totalScore) || 0,
            resources: isOneToOne
              ? {
                  audio: resolve(q.audio?.file?.name || q.audio?.name),
                }
              : undefined,
            answers: (q.answers || []).map((ans, aIdx) => ({
              option_label: ans.option_label || String.fromCharCode(65 + aIdx),
              answer_text: ans.text || ans.answer_text || '',
              is_correct: q.correctIndex === aIdx || ans.is_correct || false,
            })),
          })),
        };
      }

      if (part.type === 'fill_in_the_blanks') {
        return {
          order,
          format: 'D',
          description: part.description || '',
          content: resolve(`part${order}_content.html`),
          resources: {
            audio: commonAudioName,
          },
          questions: (part.answers || []).map((ans, aIdx) => ({
            question_number: ans.question_number || aIdx + 1,
            explanation: ans.explanation || '',
            score: parseFloat(part.totalScore) || 0,
            answers: [
              {
                answer_text: ans.text || ans.answer || '',
                is_correct: true,
              },
            ],
          })),
        };
      }

      if (part.type === 'matching') {
        const answerIdToLabel = new Map();
        (part.answers || []).forEach((ans, aIdx) => {
          const label = ans.option_label || String.fromCharCode(65 + aIdx);
          if (ans.id) answerIdToLabel.set(ans.id, label);
        });

        return {
          order,
          format: 'E',
          description: part.description || '',
          resources: {
            audio: commonAudioName,
          },
          questions: (part.questions || []).map((q, qIdx) => {
            const answerObj = q.selectedAnswerId
              ? part.answers?.find((ans) => ans.id === q.selectedAnswerId)
              : null;

            const answerLabel = answerObj
              ? answerObj.option_label || answerIdToLabel.get(q.selectedAnswerId) || ''
              : '';

            return {
              question_number: q.question_number || qIdx + 1,
              content: q.text || '',
              explanation: q.explanation || '',
              score: parseFloat(part.totalScore) || 0,
              answers: answerObj
                ? [
                    {
                      option_label: answerLabel,
                      is_correct: true,
                      answer_text: answerObj.text || answerObj.answer_text || '',
                    },
                  ]
                : [],
            };
          }),
        };
      }

      return null;
    })
    .filter(Boolean);
};

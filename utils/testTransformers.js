/* eslint-env browser */
/* global Blob */

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
          content: isOneToOne ? undefined : resolve(`part${order}_content.html`),
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

export const collectFilesReading = (parts) => {
  const files = [];

  // Hàm tiện ích: Biến chuỗi HTML (từ CKEditor) thành File object
  const createHtmlFile = (content, filename, partOrder) => {
    // Dùng Blob để đảm bảo encoding chuẩn cho HTML
    const blob = new Blob([content], { type: 'text/html' });
    const file = new File([blob], filename, { type: 'text/html' });

    return {
      filename: filename,
      file: file,
      fileSize: file.size,
      mimeType: 'text/html',
      partOrder: partOrder,
    };
  };

  parts.forEach((part, _index) => {
    if (!part.format) return;

    const partOrder = part.order;

    // 1. Xử lý Content của Part (Ví dụ: Format G, H, I, J)
    if (part.content && typeof part.content === 'string' && part.content.trim().length > 0) {
      files.push(createHtmlFile(part.content, `part_${partOrder}_content.html`, partOrder));
    }

    // 2. Xử lý Content của từng Question (Ví dụ: Format F)
    if (part.format === 'F' && part.questions && Array.isArray(part.questions)) {
      part.questions.forEach((q, qIndex) => {
        const qNum = q.question_number || qIndex + 1;

        if (q.content && typeof q.content === 'string' && q.content.trim().length > 0) {
          files.push(
            createHtmlFile(q.content, `part_${partOrder}_question_${qNum}_content.html`, partOrder),
          );
        }
      });
    }
  });

  return files;
};

export const transformReadingPartsWithUrls = (parts, urlMap) => {
  const resolve = (filename) => {
    return urlMap[filename] || null;
  };

  return parts.map((part) => {
    const newPart = { ...part };

    // Dùng part.order để khớp với logic của collectFilesReading
    const partOrder = part.order;

    // -----------------------------------------------------------
    // 1. Thay thế URL cho Content của Part
    // (Khớp với logic: part_${partOrder}_content.html)
    // -----------------------------------------------------------
    const partContentFilename = `part_${partOrder}_content.html`;
    const partContentUrl = resolve(partContentFilename);

    // Nếu tìm thấy URL trong map (tức là file đã được tạo và upload trước đó)
    if (partContentUrl) {
      newPart.content = partContentUrl;
    }

    // -----------------------------------------------------------
    // 2. Thay thế URL cho Content của từng Question
    // (Chỉ áp dụng cho Format F)
    // -----------------------------------------------------------
    if (part.format === 'F' && Array.isArray(part.questions)) {
      newPart.questions = part.questions.map((q, qIndex) => {
        const newQuestion = { ...q };
        const qNum = q.question_number || qIndex + 1;

        // Tạo lại tên file để dò trong urlMap
        // Khớp với logic: part_${partOrder}_question_${qNum}_content.html
        const questionContentFilename = `part_${partOrder}_question_${qNum}_content.html`;
        const questionContentUrl = resolve(questionContentFilename);

        // Nếu tìm thấy URL, ghi đè vào field content
        if (questionContentUrl) {
          newQuestion.content = questionContentUrl;
        }

        return newQuestion;
      });
    }

    return newPart;
  });
};

export const transformFormatData = (data) => {
  return data.map((part) => {
    const updatedQuestions = part.questions.map((question) => {
      const { id: _id, answers, ...restQuestion } = question;
      const updatedAnswers =
        answers?.map((ans) => {
          const { id: _id, ...restAnswer } = ans;
          return restAnswer;
        }) || [];
      return {
        ...restQuestion,
        answers: updatedAnswers,
        score: part.scoreForEachQuestion,
      };
    });
    const { id: _id, scoreForEachQuestion: _scoreForEachQuestion, ...restPart } = part;
    return {
      ...restPart,
      questions: updatedQuestions,
    };
  });
};

export const transformFormatUpdateData = (data) => {
  const validActions = ['create', 'update', 'delete'];

  return data
    .filter((part) => validActions.includes(part.action))
    .map((part) => {
      const { id, scoreForEachQuestion, questions, ...restPart } = part;

      const updatedQuestions = (questions || [])
        .filter((q) => validActions.includes(q.action))
        .map((question) => {
          const { id, answers, ...restQuestion } = question;

          const updatedAnswers = (answers || [])
            .filter((ans) => validActions.includes(ans.action))
            .map((ans) => {
              const { id, ...restAnswer } = ans;
              return {
                ...(restAnswer.action !== 'create' && { id }),
                ...restAnswer,
              };
            });

          return {
            ...restQuestion,
            answers: updatedAnswers,
            score: scoreForEachQuestion,
            ...(restQuestion.action !== 'create' && { id }),
          };
        });

      return {
        ...restPart,
        questions: updatedQuestions,
        ...(restPart.action !== 'create' && { id }),
      };
    });
};

export const buildReceptiveTestPayload = (test, preparedParts, status) => {
  return {
    title: test.title,
    type: test.type,
    level: test.level,
    skill: test.skill,
    time: test.time,
    description: test.description,
    status: status || test.status,
    receptive_test: {
      receptive_parts: preparedParts.map((part) => {
        if (part.action === 'delete') {
          return { id: part.id, action: 'delete' };
        }

        const { format } = part;
        return {
          action: part.action,
          id: part.id || 0,
          order: part.order || 0,
          format: format || '',
          // F ko có content; G, H, I, J ko có description
          ...(format !== 'F' && { content: part.content || '' }),
          ...(!['G', 'H', 'I', 'J'].includes(format) && {
            description: part.description || '',
          }),
          resources: part.resources || '',

          receptive_questions: (part.questions || []).map((q) => {
            if (q.action === 'delete') {
              return { id: q.id, action: 'delete' };
            }

            return {
              action: q.action,
              id: q.id || 0,
              question_number: q.question_number || 0,
              // I và J ko có content
              ...(!['I', 'J'].includes(format) && { content: q.content || '' }),
              explanation: q.explanation || '',
              score: q.score || 0,
              resources: q.resources || '',

              receptive_answers: (q.answers || []).map((ans) => {
                if (ans.action === 'delete') {
                  return { id: ans.id, action: 'delete' };
                }

                return {
                  action: ans.action,
                  id: ans.id || 0,
                  // I không có option_label
                  ...(format !== 'I' && { option_label: ans.option_label || '' }),
                  answer_text: ans.answer_text || '',
                  is_correct: !!ans.is_correct,
                };
              }),
            };
          }),
        };
      }),
    },
  };
};

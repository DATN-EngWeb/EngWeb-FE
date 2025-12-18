export const buildFormData = (payload, parts) => {
  const formData = new FormData();

  formData.append('data', JSON.stringify(payload));

  parts.forEach((part, pIdx) => {
    if (part.audio?.file) {
      formData.append(`audio_part_${pIdx}`, part.audio.file);
    }

    part.questions?.forEach((q, qIdx) => {
      q.answers?.forEach((a, aIdx) => {
        if (a.image?.file) {
          formData.append(`img_${pIdx}_${qIdx}_${aIdx}`, a.image.file);
        }
      });
    });
  });

  return formData;
};

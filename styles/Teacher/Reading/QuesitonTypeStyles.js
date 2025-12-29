export const multipleChoiceStyles = {
  simpleBoxFlexRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  simpleBoxFlexColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  // -------- Heading Section ---------
  headingContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: { xs: 0, md: 0.5 },
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  headingCard: {
    color: 'primary.main',
    fontWeight: 600,
    lineHeight: 1.1,
    fontSize: { xs: '1rem', md: '1.2rem' },
    maxWidth: { xs: '100%', md: '100%' },
    wordBreak: 'break-word',
    hyphens: 'auto',
  },
  descriptionCard: {
    color: 'text.primary',
    fontSize: { xs: '0.6rem', md: '0.8rem' },
    lineHeight: 1.5,
    textAlign: 'center',
  },
  // -------- Config Section ---------
  buttonAndIconContainer: {
    width: 'fit-content',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
    fontSize: { xs: '0.8rem', md: '1rem' },
    cursor: 'pointer',
    '&:hover': { color: 'primary.main' },
    alignSelf: 'flex-start',
    userSelect: 'none',
  },
  questionsContainer: {
    width: '100%',
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 1,
    px: { xs: 1, md: 2 },
    py: { xs: 1, md: 2 },
    border: '1px solid',
    borderRadius: '1rem',
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'primary.main',
    },
  },
  // ------------ Questions Container -----------
  labelQuestionsContainer: {
    width: '100%',
    height: 'auto',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 1,
  },
  questionLabel: {
    width: 'auto',
    mt: { xs: 0.8, md: 0.6 },
    px: 1.2,
    py: 0.5,
    borderRadius: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: { xs: '0.8rem', md: '1rem' },
    fontWeight: 600,
    color: 'primary.contrastText',
    backgroundColor: 'dark.main',
  },
  trashIconQuestion: {
    cursor: 'pointer',
    mt: { xs: 0.8, md: 0.6 },
    fontSize: { xs: '1.8rem', md: '2rem' },
    color: 'text.gray',
  },
  trashIcon: { cursor: 'pointer', fontSize: { xs: '1.8rem', md: '2rem' }, color: 'text.gray' },
  // ------------ Option Section -----------
  listOptionContainer: {
    width: '100%',
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start ',
    justifyContent: 'flex-start',
    gap: 1,
  },
  optionContainer: {
    width: '100%',
    height: 'auto',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center ',
    justifyContent: 'flex-start',
    gap: 1,
    border: '1px solid',
    borderColor: 'gray.main',
    borderRadius: '1rem',
    px: { xs: 1, md: 2 },
    py: { xs: 0.6, md: 1 },
  },
  // Container bọc cụm icon lồng nhau bên trong Checkbox
  checkedIconWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Style cho vòng tròn rỗng (chưa chọn)
  uncheckIcon: {
    fontSize: '1.6rem',
    color: 'grey.400',
  },
  // Style cho vòng tròn ngoài (đã chọn)
  outerCircle: {
    fontSize: '1.6rem',
    color: 'primary.main',
  },
  // Style cho chấm tròn đặc bên trong (đã chọn)
  innerCircle: {
    fontSize: '0.8rem',
    position: 'absolute',
    color: 'primary.main',
  },
  // Style cho Checkbox component
  checkboxRoot: {
    p: 0.5,
    '&:hover': {
      backgroundColor: 'action.hover',
    },
  },
  optionLabel: {
    fontSize: { xs: '0.8rem', md: '1rem' },
    color: 'text.primary',
    fontWeight: 600,
  },
  optionInput: {
    flexGrow: 1,
    fontSize: { xs: '0.7rem', md: '0.9rem' },
    borderRadius: '1rem',
    width: '100%',
    height: 'auto',
    alignItems: 'flex-start',
    '& .MuiInputBase-input': {
      resize: 'none',
    },
    py: 0.5,
    px: 2,
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    // Xóa border khi hover
    '&:hover .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    // Xóa border khi đang focus (click vào)
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  },
};

export const matchingStyles = {
  linkOptionContainer: {
    width: '100%',
    height: 'auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    alignItems: 'center ',
    justifyContent: 'flex-start',
    gap: 1,
  },
  questionLabel: {
    width: { xs: '28px', md: '32px' },
    height: { xs: '28px', md: '32px' },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: 'dark.main',
    color: 'primary.contrastText',
    fontSize: { xs: '0.8rem', md: '1rem' },
    fontWeight: 600,
    mt: { xs: 0.8, md: 0.6 },
    flexShrink: 0,
  },
  selectAnswer: {
    height: 44,
    width: '100%',
    borderRadius: '1rem',
    fontSize: { xs: '0.7rem', md: '0.9rem' },
    backgroundColor: '#fff',
    '& .MuiSelect-select': {
      py: 1,
      px: 2,
    },
  },
};

export const fillBlankStyles = {
  // -------- Input Section ---------
  scoreAndCheckbox: {
    display: 'grid',
    gridTemplateColumns: { xs: '50% 50%', sm: '60% 40%' },
    gap: 2,
    width: '100%',
  },
};

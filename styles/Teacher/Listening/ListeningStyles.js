export const container = {
  backgroundColor: '#FFF4E9',
  minHeight: 'calc(100vh - 200px)',
  py: { xs: 1, md: 2 },
};

export const contentWrap = {
  maxWidth: '100%',
  width: '100%',
  mx: 'auto',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: 0,
  p: 0,
  mb: 4,
};

export const panelPaper = {
  p: { xs: 2.5, md: 3 },
  mb: 2,
  border: '1px solid',
  borderColor: 'yellow.main',
  borderRadius: '1.5rem',
  boxShadow: 'none',
  backgroundColor: '#fff',
};

export const sectionHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  mb: 1,
};

export const accentBar = {
  width: '4px',
  height: { xs: '32px', sm: '36px' },
  backgroundColor: 'yellow.main',
  borderRadius: '1rem',
};

export const twoColRow = {
  gap: 2,
  mb: 2,
  flexDirection: { xs: 'column', md: 'row' },
};

export const addPartBox = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 1.5,
  py: { xs: 1, md: 1.5 },
  mb: 3,
  cursor: 'pointer',
  border: '1px solid',
  borderColor: 'yellow.main',
  borderRadius: '999px',
  backgroundColor: '#fff',
  color: 'primary.main',
  fontWeight: 600,
  fontSize: { xs: '0.8rem', md: '1rem' },
  '&:hover': {
    backgroundColor: '#fffbeb',
    borderColor: 'yellow.main',
  },
};

export const emptyStateBox = {
  border: '1px solid',
  borderColor: 'gray.main',
  borderRadius: '1rem',
  p: { xs: 2, md: 3 },
  textAlign: 'center',
  color: 'text.primary',
  fontSize: { xs: '0.8rem', md: '1rem' },
  lineHeight: 1.7,
  fontWeight: 500,
};

export const addQuestionBox = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 1.5,
  py: { xs: 1.2, md: 1.5 },
  mt: 2,
  cursor: 'pointer',
  border: '1px solid',
  borderColor: 'gray.main',
  borderRadius: '1rem',
  color: 'text.primary',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: 'action.hover',
    borderColor: 'primary.main',
    color: 'primary.main',
  },
};

export const scrollEditorBox = {
  height: 300,
  overflowY: 'auto',
  border: 'none',
  borderRadius: '1rem',
  position: 'relative',
  zIndex: 1,
  overflow: 'visible',
};

export const numberIndicator = {
  width: 'auto',
  mt: { xs: 0.8, md: 0.6 },
  px: 1.2,
  py: 0.5,
  borderRadius: 2,
  bgcolor: 'dark.main',
  color: 'primary.contrastText',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: { xs: '0.8rem', md: '1rem' },
  fontWeight: 600,
};

export const partHeader = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  mb: 0.5,
  gap: 2,
};

export const rowContent = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  mb: 0.5,
};

export const answerImageBox = {
  border: '1px solid',
  borderColor: 'gray.main',
  borderRadius: '1rem',
  p: 2,
  minHeight: 200,
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
};

export const imageContainer = {
  flex: 1,
  width: '100%',
  height: 120,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  mb: 1,
  overflow: 'hidden',
};

export const answerLabelButton = {
  mt: 0.5,
  minWidth: 40,
  alignSelf: 'center',
  border: '1px solid',
  borderRadius: '999px',
  textTransform: 'none',
  fontWeight: 600,
};

export const labelText = {
  color: 'text.primary',
  fontSize: { xs: '0.8rem', md: '1rem' },
  lineHeight: 1.7,
  fontWeight: 500,
};

export const textInput = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '1rem',
    fontSize: { xs: '0.7rem', md: '0.9rem' },
  },
};

export const answerTextInput = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '1rem',
    fontSize: { xs: '0.7rem', md: '0.9rem' },
    '& fieldset': {
      border: 'none',
    },
    '&:hover fieldset': {
      border: 'none',
    },
    '&.Mui-focused fieldset': {
      border: 'none',
    },
  },
};

export const actionTextButton = {
  width: 'fit-content',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.5,
  fontSize: { xs: '0.75rem', md: '0.9rem' },
  cursor: 'pointer',
  userSelect: 'none',
  color: 'text.primary',
  '&:hover': {
    color: 'primary.main',
  },
};

export const addOptionButton = {
  width: '100%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 1,
  py: { xs: 0.5, md: 1 },
  mt: 2,
  fontSize: { xs: '0.8rem', md: '1rem' },
  cursor: 'pointer',
  border: '1px solid',
  borderColor: 'gray.main',
  borderRadius: '1rem',
  color: 'text.primary',
  fontWeight: 500,
  textTransform: 'none',
  '&:hover': {
    backgroundColor: 'action.hover',
    borderColor: 'primary.main',
    color: 'primary.main',
  },
};

export const trashIconButton = {
  color: 'text.gray',
  '&:hover': {
    color: 'text.primary',
  },
};

export const outlinedCard = {
  p: 2,
  borderRadius: '1rem',
  border: '1px solid',
  borderColor: 'gray.main',
  boxShadow: 'none',
};

export const answerOptionRow = {
  display: 'flex',
  alignItems: 'center',
  p: '8px 16px',
  border: '1px solid',
  borderColor: 'gray.main',
  borderRadius: '1rem',
  width: '100%',
  mb: 1,
};

export const matchingAnswerLabel = {
  width: { xs: '24px', md: '28px' },
  height: { xs: '24px', md: '28px' },
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  backgroundColor: 'transparent',
  color: 'text.primary',
  fontSize: { xs: '0.7rem', md: '0.9rem' },
  fontWeight: 600,
  mt: { xs: 0.8, md: 0.6 },
  flexShrink: 0,
};

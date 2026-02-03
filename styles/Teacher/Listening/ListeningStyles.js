export const container = {
  backgroundColor: 'background.default',
  minHeight: '100vh',
  px: { xs: 3, sm: 5, md: 10, lg: 20 },
  py: 2,
};

export const contentWrap = {
  maxWidth: 1200,
  width: '100%',
  mx: 'auto',
};

export const panelPaper = {
  p: 3,
  mb: 3,
  border: '2px solid',
  borderColor: 'yellow.main',
  borderRadius: 2,
};

export const sectionHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  mb: 2,
};

export const accentBar = {
  width: '4px',
  height: { xs: '24px', sm: '36px' },
  backgroundColor: 'yellow.main',
  borderRadius: '1rem',
};

export const twoColRow = {
  display: 'flex',
  gap: 3,
  mb: 3,
  flexDirection: { xs: 'column', md: 'row' },
};

export const addPartBox = {
  border: '2px dashed',
  borderColor: 'divider',
  bgcolor: 'primary.contrastText',
  borderRadius: 2,
  p: { xs: 3, sm: 4 },
  textAlign: 'center',
  color: 'text.secondary',
  cursor: 'pointer',
};

export const emptyStateBox = {
  border: '1px solid #ddd',
  borderRadius: 2,
  p: 3,
  textAlign: 'center',
  color: 'text.secondary',
};

export const scrollEditorBox = {
  height: 300,
  overflowY: 'auto',
  border: '1px solid #d0d0d0',
  borderRadius: '8px',
  position: 'relative',
  zIndex: 1,
  overflow: 'visible',
};

export const numberIndicator = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  bgcolor: 'black',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
  fontWeight: 600,
};

export const partHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  mb: 2,
};

export const rowContent = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

export const partTypeCard = {
  p: 2,
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  gap: 2,
};

export const answerImageBox = {
  border: '2px solid #ddd',
  borderRadius: 1,
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
};

export const mainWrapper = {
  background: '#fffaf8',
  minHeight: '100vh',
  p: { xs: 2, md: 4 },
  // width: '100%',
  // boxSizing: 'border-box',
  // overflowX: 'hidden'
};

export const paperCard = {
  p: 4,
  borderRadius: '24px',
  boxShadow: 'none',
  border: '1px solid #f0f0f0',
  mb: 4,
};

export const levelTag = (levelColor) => ({
  px: 2,
  py: 0.5,
  borderRadius: '8px',
  border: '1px solid',
  borderColor: levelColor?.border || '#eee',
  color: levelColor?.text || '#666',
  background: levelColor?.bg || '#f5f5f5',
  fontWeight: 700,
  fontSize: '0.8rem',
});

export const instructionAlert = {
  mt: 3,
  borderRadius: '16px',
  background: '#fff9c4',
  color: '#4e342e',
  '& .MuiAlert-icon': { color: '#ffb300' },
};

export const draftPaper = {
  p: 4,
  textAlign: 'center',
  borderRadius: '24px',
  border: '2px dashed #ffe0b2',
  background: '#fffdf9',
  mb: 4,
};

export const sidebarPaper = {
  p: 3,
  borderRadius: '24px',
  // mb: 3,
  boxShadow: 'none',
  textAlign: 'center',
  border: '1px solid #f0f0f0',
  width: '100%',
  height: '100%',
};

export const progressCircle = {
  width: 120,
  height: 120,
  borderRadius: '50%',
  border: '8px solid #f0f0f0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  mx: 'auto',
  mb: 2,
  position: 'relative',
};

export const forumBox = {
  p: 3,
  borderRadius: '24px',
  background: '#ffffff',
  mb: 3,
  border: '1px solid #f0f0f0',
};

export const studyTipBox = {
  p: 3,
  borderRadius: '24px',
  background: '#fff3e0',
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
};

export const historyItemPaper = {
  p: 3,
  borderRadius: '20px',
  border: '1px solid #f0f0f0',
  boxShadow: 'none',
  transition: 'all 0.2s',
  '&:hover': {
    borderColor: '#ffb300',
    backgroundColor: '#fffdf9',
    boxShadow: 'none',
  },
};

export const tableContainer = {
  width: '100%',
  overflowX: 'auto',
  borderRadius: '20px',
  border: '1px solid #f0f0f0',
  background: 'white',
};

export const tableHead = {
  background: '#fcfcfc',
  '& th': {
    fontWeight: 800,
    color: '#4e342e',
    fontSize: '0.85rem',
    borderBottom: '1px solid #f0f0f0',
    py: 2,
  },
};

export const tableRow = {
  transition: 'all 0.2s',
  '&:hover': {
    background: '#fffdf9',
  },
  '& td': {
    py: 2,
    borderBottom: '1px solid #f8f8f8',
  },
};

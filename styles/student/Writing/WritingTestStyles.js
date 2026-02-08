export const mainContainer = {
  backgroundColor: 'gray.light',
  px: { xs: 2, md: 4, lg: 6 },
  // py: 2,
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  overflow: 'hidden',
};

export const headerBox = {
  p: 2,
  borderBottom: '1px solid #eee',
  bgcolor: 'white',
};

export const testHeaderContainer = {
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  px: 8,
  py: 2,
  bgcolor: 'white',
  borderBottom: '1px solid #eee',
  position: 'sticky',
  top: 0,
  zIndex: 10,
};

export const levelTag = {
  px: 2,
  py: 0.5,
  borderRadius: '8px',
  border: '1px solid #2ecc71',
  color: '#2ecc71',
  bgcolor: '#f0fff4',
  fontSize: '0.875rem',
  fontWeight: 600,
  ml: 2,
};

export const timerBox = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  color: '#5d4037',
  fontWeight: 700,
  fontSize: '1.25rem',
};

export const groupIcon = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.8,
};
export const divider = {
  width: 4,
  height: 4,
  bgcolor: '#ff7043',
  borderRadius: '50%',
  opacity: 0.5,
};
export const contentWrapper = {
  flexGrow: 1,
  overflow: 'hidden',
  p: 2,
};

export const panelScrollBox = (isLeft = true) => ({
  height: '100%',
  overflowY: 'auto',
  [isLeft ? 'pr' : 'pl']: 1,
});

export const resizeHandle = {
  width: '8px',
  cursor: 'col-resize',
  backgroundColor: 'transparent',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: '#e0e0e0',
  },
};

export const outlineButton = {
  bgcolor: '#e0d5d0',
  color: 'primary.main',
  mb: 2,
  textTransform: 'none',
  borderRadius: '10px',
  '&:hover': {
    bgcolor: '#d4c5bf',
  },
};

export const outlinePaper = {
  p: 2,
  mb: 2,
  bgcolor: '#fff3e0',
  borderRadius: '12px',
};

export const writingPaper = {
  p: 3,
  borderRadius: '16px',
  border: '1px solid #eee',
  boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
};

export const progressBarWrapper = {
  mb: 2,
};

export const progressBarStyle = {
  flexGrow: 1,
  height: 10,
  borderRadius: 5,
  bgcolor: '#eee',
  '& .MuiLinearProgress-bar': {
    bgcolor: '#ffc107',
  },
};

export const textFieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    bgcolor: 'white',
    transition: 'border-color 0.2s',
    '& fieldset': {
      borderColor: '#eee',
    },
    '&:hover fieldset': {
      borderColor: '#ffc107',
    },
  },
};

export const forumBox = {
  mt: 2,
  p: 2,
  border: '1px solid #ffe0b2',
  borderRadius: '12px',
  bgcolor: '#fffdf9',
  color: 'primary.main',
};
export const forumCheckbox = {
  '& .MuiFormControlLabel-label': {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#4e342e', // Màu nâu đồng bộ với thiết kế
  },
  '& .MuiCheckbox-root': {
    color: '#4e342e', // Màu khi chưa check
    '&.Mui-checked': {
      color: '#4e342e', // Màu khi đã check
    },
  },
  display: 'flex',
  justifyContent: 'center',
};

export const submitButton = (disabled) => ({
  fullWidth: true,
  variant: 'contained',
  py: 1.5,
  textTransform: 'none',
  borderRadius: '8px',
  bgcolor: disabled ? '#e0e0e0' : '#5d4037',
  color: disabled ? '#616161' : '#fff',
  boxShadow: 'none',
});

export const aiButton = {
  fullWidth: true,
  variant: 'contained',
  py: 1.5,
  textTransform: 'none',
  borderRadius: '8px',
  bgcolor: '#ffc107',
  color: 'black',
  boxShadow: 'none',
  '&:hover': {
    bgcolor: '#ffb300',
  },
};

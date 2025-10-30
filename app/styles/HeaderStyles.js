export const appBarStyles = {
  backgroundColor: '#fff4e9',
  color: '#171717',
  boxShadow: 'none',
  borderBottom: '1px solid #f0e6da',
};

export const toolbarStyles = {
  justifyContent: 'space-between',
};

export const navBoxStyles = {
  display: { xs: 'none', md: 'flex' },
  gap: 3,
};

export const navButtonStyles = {
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.9rem',
  color: '#4b3b35',
};

const brown = '#5a2b22';

export const actionBoxStyles = {
  display: 'flex',
  gap: 1.5,
};

export const registerButtonStyles = {
  variant: 'outlined',
  sx: {
    backgroundColor: 'transparent',
    color: brown,
    borderColor: brown,
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 9999,
    px: 3,
    py: 0.75,
    '&:hover': {
      backgroundColor: '#fdeee5',
      borderColor: brown,
    },
  },
};

export const loginButtonStyles = {
  variant: 'contained',
  sx: {
    backgroundColor: brown,
    color: '#ffffff',
    borderRadius: 9999,
    px: 3,
    py: 0.75,
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: '#4a231c',
      boxShadow: 'none',
    },
  },
};

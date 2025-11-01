export const appBarStyles = {
  backgroundColor: 'background.default',
  color: 'text.primary',
};

export const toolbarStyles = {
  justifyContent: 'space-between',
};

export const navBoxStyles = {
  display: { xs: 'none', md: 'flex' },
};

export const navButtonStyles = {
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '1.2rem',
  color: 'primary.main',
  marginRight: '50px',
};

export const actionBoxStyles = {
  display: 'flex',
  gap: 1.5,
};

export const registerButtonStyles = {
  variant: 'outlined',
  sx: {
    backgroundColor: 'transparent',
    color: 'primary.main',
    borderColor: 'primary.main',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 9999,
    px: 3,
    py: 0.75,
    '&:hover': {
      backgroundColor: 'background.default',
      borderColor: 'primary.main',
    },
  },
};

export const loginButtonStyles = {
  variant: 'contained',
  sx: {
    backgroundColor: 'primary.main',
    color: 'background.paper',
    borderRadius: 9999,
    px: 3,
    py: 0.75,
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: 'primary.dark',
      boxShadow: 'none',
    },
  },
};

export const logoLinkStyles = {
  textDecoration: 'none',
  color: 'inherit',
  paddingRight: '40px',
};

export const navLinkStyles = {
  textDecoration: 'none',
};

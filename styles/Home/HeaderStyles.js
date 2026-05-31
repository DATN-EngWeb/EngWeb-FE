export const appBarStyles = {
  backgroundColor: 'background.default',
  color: 'text.primary',
  boxShadow: 'none',
  borderBottom: 'none',
};

export const toolbarStyles = {
  justifyContent: 'space-between',
  py: { xs: 0.5, sm: 1 },
  minHeight: { xs: 48, sm: 'auto' },
};

export const navBoxStyles = {
  display: { xs: 'none', md: 'flex' },
  alignItems: 'center',
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
  gap: { xs: 0.75, sm: 1.5 },
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
    px: { xs: 1.1, sm: 3 },
    py: { xs: 0.25, sm: 0.75 },
    fontSize: { xs: '0.72rem', sm: '0.875rem' },
    minWidth: { xs: 80, sm: 'auto' },
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
    width: { xs: 'auto', sm: '115px' },
    color: 'background.paper',
    borderRadius: 9999,
    px: { xs: 1.1, sm: 3 },
    py: { xs: 0.25, sm: 0.75 },
    fontSize: { xs: '0.72rem', sm: '0.875rem' },
    minWidth: { xs: 72, sm: '115px' },
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
  display: 'flex',
  alignItems: 'center',
  paddingTop: { xs: '4px', sm: '6px' }, // smaller on mobile
};

export const navLinkStyles = {
  textDecoration: 'none',
};

export const userPopupBackdropStyles = {
  position: 'fixed',
  inset: 0,
  zIndex: 1200,
};

export const userPopupContainerStyles = {
  position: 'absolute',
  top: 'calc(100% + 12px)',
  right: 0,
  zIndex: 1300,
  width: 320,
  background: '#fff',
  borderRadius: 20,
  boxShadow: '0 8px 40px rgba(0,0,0,0.13)',
  overflow: 'hidden',
  animation: 'popupFadeIn 0.18s ease',
};

export const userPopupHeaderStyles = {
  padding: '20px 20px 16px',
  background: '#faf9f7',
};

export const userPopupAvatarNameBoxStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  marginBottom: 16,
};

export const userPopupAvatarWrapperStyles = {
  width: 60,
  height: 60,
  borderRadius: '50%',
  border: '3px solid #e8c84a',
  overflow: 'hidden',
  flexShrink: 0,
  background: '#e0e0e0',
};

export const userPopupAvatarImgStyles = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

export const userPopupAvatarFallbackStyles = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#1a3c5e',
  color: '#fff',
  fontSize: 24,
  fontWeight: 700,
};

export const userPopupUsernameStyles = {
  fontWeight: 700,
  fontSize: 17,
  color: '#1a1a1a',
  lineHeight: 1.2,
};

export const userPopupLevelStyles = {
  fontSize: 12,
  color: '#b8860b',
  fontWeight: 600,
  letterSpacing: 0.8,
  marginTop: 3,
};

export const userPopupXpRowStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 6,
};

export const userPopupXpLabelStyles = {
  fontSize: 11,
  fontWeight: 700,
  color: '#888',
  letterSpacing: 1,
};

export const userPopupXpValueStyles = {
  fontSize: 11,
  fontWeight: 700,
  color: '#b8860b',
};

export const userPopupXpBarContainerStyles = {
  height: 8,
  borderRadius: 99,
  background: '#e5e5e5',
  overflow: 'hidden',
};

export const getUserPopupXpBarFillStyles = (xpPercent) => ({
  height: '100%',
  width: `${xpPercent}%`,
  borderRadius: 99,
  background: 'linear-gradient(90deg, #c8960c, #e8c84a)',
  transition: 'width 0.5s ease',
});

export const userPopupAiTerminalStyles = {
  padding: '14px 20px 4px',
};

export const userPopupAiTitleStyles = {
  fontSize: 11,
  fontWeight: 700,
  color: '#555',
  letterSpacing: 1,
  marginBottom: 10,
};

export const userPopupAiBoxStyles = {
  display: 'flex',
  gap: 10,
  marginBottom: 4,
};

export const userPopupTurnsCardStyles = {
  flex: 1,
  background: '#f5f3ef',
  borderRadius: 12,
  padding: '10px 14px',
};

export const userPopupTurnsLabelStyles = {
  fontSize: 11,
  color: '#888',
  marginBottom: 4,
};

export const userPopupTurnsValueStyles = {
  fontSize: 20,
  fontWeight: 700,
  color: '#b8860b',
};

export const userPopupMaxTurnsStyles = {
  fontSize: 13,
  fontWeight: 400,
  color: '#aaa',
};

export const userPopupBonusValueBoxStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

export const userPopupBonusValueStyles = {
  fontSize: 20,
  fontWeight: 700,
  color: '#2e7d32',
};

export const userPopupBonusIconStyles = {
  width: 18,
  height: 18,
  borderRadius: '50%',
  background: '#2e7d32',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontSize: 11,
  fontWeight: 700,
};

export const userPopupDividerStyles = {
  height: 1,
  background: '#f0f0f0',
  margin: '10px 0',
};

export const userPopupMenuContainerStyles = {
  padding: '4px 0 8px',
};

export const userPopupMenuItemStyles = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: '12px 20px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#222',
  fontSize: 15,
  fontWeight: 500,
  textAlign: 'left',
  transition: 'background 0.15s',
};

export const userPopupMenuItemLogoutStyles = {
  ...userPopupMenuItemStyles,
  color: '#e53935',
  fontWeight: 600,
};

export const userPopupMenuItemIconStyles = {
  color: '#555',
};

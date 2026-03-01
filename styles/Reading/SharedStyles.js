import theme from '../../theme/theme';

export const containerStyles = {
  backgroundColor: theme.palette.reading.contentBg,
  minHeight: 'calc(100vh - 200px)',
  pt: 2,
  pb: 4,
};

export const headerWrapperStyles = {
  backgroundColor: 'background.paper',
  borderRadius: '0px',
  padding: '16px 0',
  boxShadow: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
};

export const headerSectionStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: 2,
};

export const testNameStyles = {
  fontSize: '2rem',
  fontWeight: 'bold',
  color: 'darkGrey.main',
  mb: 0.5,
};

export const partTitleStyles = {
  fontSize: '1.1rem',
  color: 'secondary.main',
  fontWeight: 500,
};

export const submitButtonStyles = {
  backgroundColor: 'warning.main',
  color: 'text.primary',
  fontWeight: 600,
  px: 4,
  py: 1.5,
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '0.875rem',
  '&:hover': {
    backgroundColor: 'warning.light',
    boxShadow: 'none',
  },
  boxShadow: 'none',
};

export const tabsContainerStyles = {
  display: 'flex',
  justifyContent: 'center',
};

export const tabStyles = {
  textTransform: 'none',
  fontSize: '0.875rem',
  fontWeight: 500,
  minHeight: 44,
  px: 3.5,
  py: 0.75,
  borderRadius: 3,
  border: '1px solid',
  borderColor: 'divider',
  backgroundColor: 'action.hover',
  mr: 1,
  transition: 'all 0.2s ease',
};

export const contentWrapperStyles = {
  display: 'flex',
  gap: 2,
  mb: 4,
  flexDirection: { xs: 'column', lg: 'row' },
};

export const leftPaneStyles = {
  flex: 1.3,
  backgroundColor: 'background.paper',
  borderRadius: 0,
  p: 3,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  minHeight: { xs: 'auto', lg: '600px' },
};

export const passageTitleStyles = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: 'darkGrey.main',
  mb: 2,
};

export const passageTextStyles = {
  fontSize: '1rem',
  lineHeight: 1.8,
  color: 'text.primary',
  whiteSpace: 'pre-wrap',
};

export const rightPaneStyles = {
  flex: 0.9,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

export const instructionBoxStyles = {
  backgroundColor: theme.palette.reading.instructionBg,
  borderRadius: '8px',
  p: 2,
  display: 'flex',
  gap: 1.5,
  alignItems: 'flex-start',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  border: `1px solid ${theme.palette.reading.instructionBorder}`,
};

export const instructionIconStyles = {
  color: theme.palette.reading.instructionIcon,
  display: 'flex',
  alignItems: 'center',
  mt: 0.5,
};

export const navigationFooterStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  pt: 2.5,
  mt: 2,
  borderTop: '1px solid',
  borderColor: 'divider',
  flexWrap: 'wrap',
  gap: 1.5,
};

export const backLinkStyles = {
  color: 'text.secondary',
  textTransform: 'none',
  fontSize: '0.875rem',
  fontWeight: 500,
  minWidth: 'auto',
  padding: '6px 12px',
  '&:hover': {
    backgroundColor: 'transparent',
    color: 'text.primary',
  },
  '&.Mui-disabled': {
    color: 'text.disabled',
  },
};

export const sectionInfoStyles = {
  fontSize: '0.875rem',
  color: 'text.secondary',
  fontWeight: 500,
};

export const nextButtonStyles = {
  backgroundColor: 'darkGrey.main',
  color: 'background.paper',
  textTransform: 'none',
  fontSize: '0.875rem',
  fontWeight: 600,
  px: 2.5,
  py: 0.75,
  borderRadius: '6px',
  minWidth: 'auto',
  '&:hover': {
    backgroundColor: 'primary.dark',
  },
  '&.Mui-disabled': {
    backgroundColor: 'action.disabledBackground',
    color: 'action.disabled',
  },
};

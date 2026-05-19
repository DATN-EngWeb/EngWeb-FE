import {
  containerStyles,
  headerWrapperStyles,
  headerSectionStyles,
  testNameStyles,
  partTitleStyles,
  submitButtonStyles,
  tabsContainerStyles,
  tabStyles,
  contentWrapperStyles,
  leftPaneStyles,
  passageTitleStyles,
  rightPaneStyles,
  instructionBoxStyles,
  instructionIconStyles,
  navigationFooterStyles,
  backLinkStyles,
  sectionInfoStyles,
  nextButtonStyles,
} from './SharedStyles';

export {
  containerStyles,
  headerWrapperStyles,
  headerSectionStyles,
  testNameStyles,
  partTitleStyles,
  submitButtonStyles,
  tabsContainerStyles,
  tabStyles,
  contentWrapperStyles,
  leftPaneStyles,
  passageTitleStyles,
  rightPaneStyles,
  instructionBoxStyles,
  instructionIconStyles,
  navigationFooterStyles,
  backLinkStyles,
  sectionInfoStyles,
  nextButtonStyles,
};

export const passageContainerStyles = {
  fontSize: '1rem',
  lineHeight: 1.8,
  color: 'text.primary',
  whiteSpace: 'pre-wrap',
};

export const answerInputContainerStyles = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 2,
};

export const answerInputBoxStyles = {
  backgroundColor: 'background.paper',
  p: 2,
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-2px)',
  },
};

export const answerNumberStyles = {
  width: 32,
  height: 32,
  borderRadius: '4px',
  backgroundColor: 'primary.main',
  color: 'background.paper',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 600,
  fontSize: '1rem',
  flexShrink: 0,
};

export const answerInputStyles = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#ffffff',
    '& fieldset': {
      borderColor: 'divider',
      borderWidth: 1,
    },
    '&:hover fieldset': {
      borderColor: 'secondary.main',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'secondary.main',
    },
  },
  '& .MuiInputBase-input': {
    fontSize: '0.95rem',
    fontWeight: 500,
  },
};

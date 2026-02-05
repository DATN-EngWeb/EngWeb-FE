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
  passageTextStyles,
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
  passageTextStyles,
  rightPaneStyles,
  instructionBoxStyles,
  instructionIconStyles,
  navigationFooterStyles,
  backLinkStyles,
  sectionInfoStyles,
  nextButtonStyles,
};

export const questionContainerStyles = {
  backgroundColor: 'background.paper',
  borderRadius: '8px',
  p: 2.5,
  display: 'flex',
  gap: 2,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  mb: 2,
};

export const questionNumberStyles = {
  width: 32,
  height: 32,
  backgroundColor: 'text.primary',
  color: 'background.paper',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 600,
  fontSize: '1rem',
  flexShrink: 0,
};

export const questionTextStyles = {
  fontSize: '1rem',
  fontWeight: 500,
  color: 'text.primary',
  mb: 1,
};

export const optionContainerStyles = {
  backgroundColor: 'background.paper',
  borderRadius: '8px',
  p: 1.5,
  mb: 1,
  border: '1px solid',
  borderColor: 'divider',
  '&:hover': {
    backgroundColor: 'background.default',
  },
  '&.Mui-disabled': {
    opacity: 0.7,
  },
};

export const optionLabelStyles = {
  fontSize: '0.95rem',
  color: 'text.primary',
  ml: 1,
};

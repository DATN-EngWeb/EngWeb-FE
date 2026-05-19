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
  richTextStyles,
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
  richTextStyles,
};

export const questionContainerStyles = {
  backgroundColor: 'background.paper',
  borderRadius: '8px',
  p: 2,
  display: 'flex',
  gap: 1.5,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
};

export const questionNumberStyles = {
  width: 32,
  height: 32,
  backgroundColor: 'primary.main',
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
  fontSize: '0.9rem',
  fontWeight: 500,
  color: 'text.primary',
  mb: 1,
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
};

export const optionContainerStyles = {
  backgroundColor: 'background.paper',
  borderRadius: '8px',
  p: 1.25,
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
  fontSize: '0.875rem',
  color: 'text.primary',
  ml: 1,
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
};

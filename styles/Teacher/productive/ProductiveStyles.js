export const container = {
  backgroundColor: 'background.default',
  minHeight: '100vh',
  px: { xs: 2, md: 4, lg: 6 },
  py: 2,
};

export const INNER_CONTAINER_STYLE = (showPreview) => ({
  px: { xs: 2, md: 5, lg: 8 },
  mt: -4,
  bgcolor: 'primary.contrastText',
  display: 'flex',
  gap: 4,
  flexDirection: { xs: 'column', lg: 'row' },
  alignItems: 'flex-start',
  justifyContent: 'center',
  pb: 6,
  ...(showPreview && { width: '100%' }),
  margin: '0 auto',
});

export const SECTION_TITLE_STYLE = {
  fontWeight: 800,
  color: 'primary.main',
  mb: 3,
};

export const panelPaper = {
  p: 3,
  mb: 3,
  border: '0.5px solid',
  borderColor: 'secondary.main',
  borderRadius: '12px',
  backgroundColor: 'primary.contrastText',
  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.03)',
  //minWidth: { lg: '400px', md: '350px' },
};

export const sectionHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  mb: 3,
};

export const accentBar = {
  width: '4px',
  height: '24px',
  borderRadius: '4px',
  mr: 1.5,
};

export const twoColRow = {
  display: 'flex',
  gap: 2,
  mb: 3,
  flexDirection: { xs: 'column', sm: 'row' },
  '& > *': {
    flex: 1,
    width: '100%',
  },
};

export const SECTION_LABEL = (color) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  fontWeight: 700,
  mb: 2,
  color: 'primary.main',
  '&::before': {
    content: '""',
    display: 'inline-block',
    width: '4px',
    height: '24px',
    backgroundColor: color,
    borderRadius: '4px',
  },
});

export const STICKY_PREVIEW_WRAPPER = {
  position: 'sticky',
  transition: 'all 0.3s ease',
  //minWidth: '300px',
};

export const PREVIEW_PAPER_STYLE = {
  p: 4,
  borderRadius: '12px',
  backgroundColor: 'primary.contrastText',
  minHeight: '600px',
  boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.05)',
  border: `0.5px solid `,
  borderColor: `darkGrey.light`,
  backgroundImage: 'linear-gradient(#fff 0%, #fdfdfd 100%)',
};

export const SUGGESTION_BOX_STYLE = {
  backgroundColor: 'warning.pastel',
  p: 2,
  borderRadius: '8px',
  mt: 2,
  borderLeft: `4px solid ${'secondary.main'}`,
};

export const scrollEditorBox = {
  height: 300,
  overflowY: 'auto',
  border: `1px solid ${'info.pastel'}`,
  borderRadius: '8px',
  position: 'relative',
  zIndex: 1,
  overflow: 'visible',
};
export const rowContent = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

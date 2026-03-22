export const mainWrapper = {
  bgcolor: '#F9F6F0',
  minHeight: '100vh',
  py: { xs: 3, md: 5 },
  px: { xs: 2, md: 4 },
};

export const layoutContainer = {
  maxWidth: '1440px',
  mx: 'auto',
};

export const gridLayout = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', lg: '1fr 1.2fr 340px' },
  gap: 3,
  alignItems: 'start',
};

export const leftColumn = {
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export const middleColumn = {
  bgcolor: '#fff',
  borderRadius: 3,
  p: { xs: 3, md: 5 },
  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
  minHeight: '80vh',
};

export const rightColumn = {
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export const promptImageContainer = {
  width: '100%',
  borderRadius: 3,
  overflow: 'hidden',
  mb: 2,
};

export const instructionsBox = {
  bgcolor: '#fff',
  borderRadius: 2,
  p: 2.5,
  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
};

export const instructionItem = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 1,
  mb: 1,
  color: '#333',
  fontSize: '0.85rem',
  '&:before': {
    content: '""',
    width: 4,
    height: 4,
    borderRadius: '50%',
    bgcolor: '#ed6c02',
    mt: 1,
  },
};

export const metricsDisplay = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
};

export const textContent = {
  color: '#333',
  lineHeight: 1.8,
  fontSize: '0.95rem',
  whiteSpace: 'pre-wrap',
};

export const scoreRingWrapper = {
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 140,
  height: 140,
  mx: 'auto',
  mb: 3,
};

export const editorialSummary = {
  textAlign: 'center',
  mb: 4,
  color: '#555',
  fontSize: '0.9rem',
  lineHeight: 1.6,
};

export const feedbackCard = {
  bgcolor: '#fff',
  borderRadius: 3,
  p: 2.5,
  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
  mb: 2,
};

export const feedbackIconWrapper = {
  display: 'flex',
  gap: 1.5,
  alignItems: 'flex-start',
};

export const tryAgainButton = {
  bgcolor: '#8B5A2B', // Brown color
  color: '#fff',
  '&:hover': { bgcolor: '#6B4226' },
  borderRadius: 2,
  py: 1.5,
  fontWeight: 600,
  textTransform: 'none',
  width: '100%',
  mt: 2,
};

export const dotsContainer = {
  display: 'flex',
  gap: '4px',
  alignItems: 'center',
};

// Styles for HistoryAIFeedbackModal (old layout)
export const summaryCard = {
  borderRadius: 6,
  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
  height: '100%',
  p: 2,
  bgcolor: '#fff',
};

export const NextActionCard = {
  borderRadius: 6,
  bgcolor: '#FFFDF0',
  border: '1px solid #fff9c4',
  height: '100%',
  p: 2,
};

export const categoryCard = {
  borderRadius: 5,
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  position: 'relative',
};

export const categoryHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  mb: 3,
};

export const categoryContent = {
  bgcolor: '#e0f7fa',
  color: '#00838f',
  fontWeight: '800',
  fontSize: '0.7rem',
};

export const accordionStyle = {
  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
  mb: 2,
  borderRadius: '12px !important',
  '&::before': { display: 'none' },
  overflow: 'hidden',
  border: '1px solid #eee',
};

export const accordionSummary = {
  bgcolor: '#fafafa',
  borderBottom: '1px solid #f5f5f5',
  minHeight: '48px !important',
  '& .MuiAccordionSummary-content': {
    my: '12px !important',
  },
};

export const accordionDetails = {
  p: { xs: 2, md: 2.5 },
  bgcolor: '#fff',
};

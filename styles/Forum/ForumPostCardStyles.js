const card = { mb: 3, borderRadius: 3 };
const authorName = { fontWeight: 600, fontSize: { xs: 15, sm: 16 } };
const moreButton = {
  ml: 'auto',
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  color: 'text.secondary',
  width: 32,
  height: 32,
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
  transition: 'all 0.15s ease',
  '&:hover': { bgcolor: 'grey.100', borderColor: 'primary.main', color: 'primary.main' },
};

const menuPaper = {
  mt: 1,
  minWidth: 100,
  borderRadius: 2,
  overflow: 'hidden',
  border: '1px solid',
  borderColor: 'grey.200',
  boxShadow: '0px 8px 20px rgba(0,0,0,0.06)',
};

const menuItem = {
  py: 0.6,
  px: 1.25,
  borderRadius: 1,
  fontSize: '13px',
  lineHeight: 1.2,
};

const deleteMenuItem = {
  py: 0.6,
  px: 1.25,
  borderRadius: 1,
  color: 'error.main',
  fontSize: '13px',
  lineHeight: 1.2,
  '& .MuiListItemIcon-root': { color: 'error.main' },
  '&:hover': { backgroundColor: 'error.lighter' },
};

const description = { fontSize: { xs: '14px', sm: '15px' } };
const title = {
  mt: 1.5,
  fontWeight: 700,
  fontSize: { xs: '15px', sm: '16px', md: '17px' },
  lineHeight: 1.35,
};
const userAnswer = { whiteSpace: 'pre-line', fontSize: { xs: '13px', sm: '14px' } };

const likeButton = {
  textTransform: 'none',
  color: 'text.secondary',
  fontWeight: 700,
  fontSize: '14px',
  minHeight: 34,
  px: 1.25,
  '& .MuiButton-startIcon svg': { fontSize: '1.1rem' },
  '&:hover': { bgcolor: 'transparent', color: 'error.light' },
};

const commentButton = {
  textTransform: 'none',
  color: 'text.secondary',
  fontWeight: 700,
  fontSize: '13px',
  minHeight: 34,
  px: 1.25,
  '& .MuiButton-startIcon svg': { fontSize: '1.1rem' },
  '&:hover': { bgcolor: 'transparent' },
};

const countText = { fontSize: { xs: '13px', sm: '14px' } };

const editDialogTitle = { color: 'primary.main' };
const editDialogContent = { pt: 1 };

const deleteDialogPaper = {
  borderRadius: 3,
  border: '1px solid #f2c36f',
  bgcolor: 'white',
  boxShadow: '0 12px 32px rgba(83, 40, 34, 0.12)',
  overflow: 'hidden',
};

const deleteDialogContent = { p: 0 };

const deleteDialogSurface = {
  display: 'flex',
  alignItems: 'flex-start',
  width: '100%',
  gap: 1.5,
  px: 2.25,
  py: 2.25,
};

const deleteIconWrap = {
  width: 34,
  height: 34,
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  color: '#6B2C1F',
  flexShrink: 0,
  bgcolor: 'rgba(107, 44, 31, 0.08)',
};

const deleteTitle = { fontWeight: 900, fontSize: '1.1rem', color: '#4e342e', lineHeight: 1.2 };
const deleteDescription = { mt: 0.5, color: '#f2994a', fontWeight: 600, lineHeight: 1.4 };
const deleteActions = { px: 0, pt: 2, pb: 0, justifyContent: 'flex-end', gap: 1 };

const deleteCancelButton = {
  minWidth: 92,
  borderRadius: 2,
  textTransform: 'none',
  fontWeight: 800,
  color: '#4e342e',
  borderColor: '#d9c6b6',
  bgcolor: '#fff',
  '&:hover': { borderColor: '#bfa890', bgcolor: '#fff7f0' },
};

const deleteConfirmButton = {
  minWidth: 92,
  borderRadius: 2,
  textTransform: 'none',
  fontWeight: 800,
  bgcolor: '#f04b43',
  boxShadow: 'none',
  '&:hover': { bgcolor: '#d83c35', boxShadow: 'none' },
};

export default {
  card,
  authorName,
  moreButton,
  menuPaper,
  menuItem,
  deleteMenuItem,
  title,
  description,
  userAnswer,
  likeButton,
  commentButton,
  countText,
  editDialogTitle,
  editDialogContent,
  deleteDialogPaper,
  deleteDialogContent,
  deleteDialogSurface,
  deleteIconWrap,
  deleteTitle,
  deleteDescription,
  deleteActions,
  deleteCancelButton,
  deleteConfirmButton,
};

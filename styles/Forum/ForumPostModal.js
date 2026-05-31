const dialogContent = {
  p: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  height: '100%',
};

const scrollableContent = {
  flex: 1,
  overflowY: 'auto',
  minHeight: 0,
  px: 3,
  py: 2,
};

const headerBox = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: 0.5,
};

const closeButton = {
  color: 'text.secondary',
};

const stickyHeader = {
  position: 'sticky',
  top: 0,
  bgcolor: '#f5f5f5',
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  px: 1,
  py: 0.5,
  zIndex: 10,
  borderBottom: '1px solid #e0e0e0',
};

const stickyCloseButton = {
  color: 'text.secondary',
  '&:hover': {
    bgcolor: 'grey.200',
  },
};

const skillChip = {
  bgcolor: '#6B2C1F',
  color: '#fff',
};

const userAnswerBox = {
  bgcolor: '#f8eee7',
  borderRadius: 2,
};

const userAnswerText = {
  whiteSpace: 'pre-line',
  color: '#333',
};

const likeCommentBox = {
  borderTop: '1px solid #f0f0f0',
  pt: 2,
  mt: 2,
  mb: 2,
};

const likeButton = {
  textTransform: 'none',
  color: 'text.secondary',
  fontWeight: 700,
  p: 0,
  minWidth: 'auto',
  '&:hover': { bgcolor: 'transparent', color: 'error.light' },
};

const selectSort = {
  minWidth: 130,
  height: 40,
  borderRadius: 2,
  fontSize: '14px',
  color: 'primary.main',
  '& .MuiSelect-select': {
    height: 40,
    display: 'flex',
    alignItems: 'center',
    py: 0,
  },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
};

const selectMenuProps = {
  PaperProps: {
    sx: {
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      mt: 1,
    },
  },
  MenuListProps: { sx: { py: 0.5 } },
};

const selectMenuItem = {
  fontSize: '14px',
  color: 'primary.main',
};

const commentAvatar = {
  width: 36,
  height: 36,
};

const commentBubble = {
  bgcolor: '#f0f0f0',
  borderRadius: 2,
  px: 2,
  py: 1.5,
  position: 'relative',
};

const commentMoreButton = {
  position: 'absolute',
  top: 2,
  right: 4,
};

const editCommentField = {
  background: '#fff',
  borderRadius: 1,
};

const editCommentButton = {
  minWidth: 0,
  px: 1.5,
  borderRadius: 2,
};

const commentContent = {
  whiteSpace: 'pre-line',
};

const commentTimestamp = {
  position: 'absolute',
  top: 10,
  color: '#6B2C1F',
};

// Edit post dialog
const editDialogTitle = {
  fontWeight: 700,
  fontSize: '1.1rem',
  color: 'primary.main',
};

const editDialogContent = {
  pt: 1,
};

const editDialogActions = {
  px: 2,
  pb: 2,
};

const editDialogButton = {
  px: 2,
};

const loadMoreButton = {
  textTransform: 'none',
  color: '#6B2C1F',
};

const loadMoreSpinner = {
  mr: 1,
};

const commentInputBox = {
  borderTop: '1px solid #eee',
  px: 2,
  py: 1.5,
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  bgcolor: '#fff',
};

const commentInput = {
  '& .MuiOutlinedInput-root': { borderRadius: 6 },
};

const sendButton = {
  color: '#6B2C1F',
};

// Post action menu and dialog styles
const postMenuBox = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: 0.5,
};

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
  fontSize: '15px',
  lineHeight: 1.2,
};

const deleteMenuItem = {
  py: 0.6,
  px: 1.25,
  borderRadius: 1,
  color: 'error.main',
  fontSize: '15px',
  lineHeight: 1.2,
};

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
  dialogContent,
  scrollableContent,
  headerBox,
  closeButton,
  stickyHeader,
  stickyCloseButton,
  skillChip,
  userAnswerBox,
  userAnswerText,
  likeCommentBox,
  likeButton,
  selectSort,
  selectMenuProps,
  selectMenuItem,
  commentAvatar,
  commentBubble,
  commentMoreButton,
  commentTimestamp,
  editDialogTitle,
  editDialogContent,
  editDialogActions,
  editDialogButton,
  editCommentField,
  editCommentButton,
  commentContent,
  loadMoreButton,
  loadMoreSpinner,
  commentInputBox,
  commentInput,
  sendButton,
  postMenuBox,
  moreButton,
  menuPaper,
  menuItem,
  deleteMenuItem,
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

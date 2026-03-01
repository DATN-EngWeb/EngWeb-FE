export const uploadReadingStyles = {
  mainContainer: {
    pb: { xs: 1, md: 2 },
    backgroundColor: 'background.default',
  },
  // -------- Card Title Section ---------
  cardTitle: {
    height: 'auto',
    width: '100%',
    borderRadius: '1rem',
    backgroundColor: '#fff',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: { xs: 'center', md: 'flex-start' },
    justifyContent: 'flex-start',
    gap: 1,
    px: 4,
    py: 2,
    mb: 2,
  },
  mainTitleHeading: {
    color: 'primary.main',
    fontWeight: 600,
    lineHeight: 1.1,
    letterSpacing: '-0.5px',
    fontSize: { xs: '1rem', sm: '1.8rem' },
    maxWidth: { xs: '100%', sm: '100%' },
    wordBreak: 'break-word',
    hyphens: 'auto',
  },
  description: {
    color: 'text.primary',
    fontSize: { xs: '0.8rem', md: '1rem' },
    lineHeight: 1.7,
    textAlign: { xs: 'center', md: 'left' },
  },
  // -------- Function Buttons Wrapper ---------
  functionButtonsWrapper: {
    display: 'grid',
    gap: { xs: 1, md: 2 },
    mb: 2,
    alignItems: 'center',
    gridTemplateAreas: {
      xs: `
      "item1 item4"
      "item2 item3"
    `,
      sm: `
      "item1 item2 item3 item4"
    `,
      md: `
      "item1 item2 item3 item4"
    `,
    },
    gridTemplateColumns: {
      xs: '1fr 1fr',
      sm: '1fr auto auto auto',
      md: '1fr auto auto auto',
    },
    justifyItems: {
      xs: 'stretch',
      sm: 'start',
      md: 'start',
    },
  },
  previewButton: {
    color: 'primary.main',
    fontWeight: 500,
    fontSize: { xs: '0.7rem', md: '1rem' },
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    px: 4,
  },
  rightButton: {
    backgroundColor: 'natural.background',
    color: 'primary.main',
    fontWeight: 500,
    fontSize: { xs: '0.7rem', md: '1rem' },
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    px: 2.5,
    boxShadow: '0 4px 3px 1px rgba(97, 97, 97, 0.2)',
    '&:hover': {
      backgroundColor: 'background.default',
      boxShadow: 'none',
    },
  },
  publicButton: {
    backgroundColor: 'yellow.main',
    color: 'primary.main',
    fontSize: { xs: '0.7rem', md: '1rem' },
    fontWeight: 500,
    textTransform: 'none',
    '&:hover': {
      backgroundColor: 'warning.dark',
      boxShadow: 'none',
    },
    px: 2.5,
    boxShadow: '0 4px 3px 1px rgba(97, 97, 97, 0.2)',
  },
  // -------- Upload Reading Test Form Section ---------
  nameTestAndTime: {
    display: 'grid',
    gridTemplateColumns: '70% 30%',
    gap: 2,
    width: '100%',
  },
  uploadReadingFormSection: {
    width: '100%',
    height: 'auto',
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 2,
  },
  // -------- Basic Info Container ---------
  basicInfoContainer: {
    width: '100%',
    height: 'auto',
    backgroundColor: '#ffffff',
    border: '2px solid',
    borderColor: 'yellow.main',
    borderRadius: '1rem',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: { xs: 1, md: 2 },
    px: { xs: 2, md: 4 },
    py: { xs: 2, md: 3 },
  },
  basicInfoHeading: {
    color: 'primary.main',
    fontWeight: 600,
    lineHeight: 1.1,
    fontSize: { xs: '1rem', md: '1.2rem' },
    maxWidth: { xs: '100%', md: '100%' },
    wordBreak: 'break-word',
    hyphens: 'auto',
  },
  formControl: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5,
  },
  labelInput: {
    color: 'text.primary',
    fontSize: { xs: '0.8rem', md: '1rem' },
    lineHeight: 1.7,
    fontWeight: 500,
  },
  input: {
    height: 44,
    fontSize: { xs: '0.7rem', md: '0.9rem' },
    borderRadius: '1rem',
  },
  inputMultiline: {
    fontSize: { xs: '0.7rem', md: '0.9rem' },
    borderRadius: '1rem',
    width: '100%',
    height: 'auto',
    alignItems: 'flex-start',
    '& .MuiInputBase-input': {
      resize: 'none',
    },
    py: 1.5,
    px: 2,
  },
  // -------- Reading Content Container ---------
  addPartButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: { xs: 0, md: 1 },
    width: '100%',
    py: 1,
    border: '2px dashed',
    borderColor: 'gray.main',
    borderRadius: '1rem',
    fontSize: { xs: '0.8rem', md: '1rem' },
    color: 'text.primary',
    fontWeight: 500,
    textTransform: 'none',
  },
  partContentContainer: {
    width: '100%',
    height: 'auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 2,
  },
  selectedPart: {
    width: '100%',
    height: 'auto',
    border: { xs: '1px solid', md: '2px solid' },
    borderRadius: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: { xs: 'center', md: 'flex-start' },
    gap: { xs: 0.5, md: 2 },
    p: { xs: 1, md: 2 },
  },
  iconSelectedPart: {
    fontSize: { xs: '2rem', md: '3rem' },
    display: { xs: 'none', sm: 'block' },
  },
  partTextContainer: {
    width: 'auto',
    maxWidth: { xs: '170px', sm: '260px', md: '100%' },
    minWidth: { xs: '0px', sm: '240px', md: '0px' },
    display: 'flex',
    flexDirection: 'column',
    alignItems: { xs: 'center', md: 'flex-start' },
    justifyContent: 'center',
  },
  partTitle: {
    fontWeight: 600,
    fontSize: { xs: '0.7rem', sm: '1rem' },
  },
  partDescription: {
    color: 'text.gray',
    fontSize: { xs: '0.6rem', sm: '0.8rem' },
    // Logic xử lý dấu 3 chấm
    whiteSpace: 'nowrap', // Không cho phép xuống dòng
    overflow: 'hidden', // Ẩn phần chữ bị thừa ra ngoài
    textOverflow: 'ellipsis', // Hiển thị dấu "..."

    width: '100%', // Đảm bảo nó chiếm hết chiều rộng để xác định điểm cắt
    display: 'block',
  },
};

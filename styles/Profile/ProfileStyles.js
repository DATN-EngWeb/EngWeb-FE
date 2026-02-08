// Cover Section Styles
export const coverSectionStyles = {
  coverContainer: {
    height: 200,
    bgcolor: '#FDB954',
    position: 'relative',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  editButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  coverCameraButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    minWidth: '40px',
    width: '40px',
    height: '40px',
    padding: 0,
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 10,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    display: 'flex',
    gap: 1,
    zIndex: 10,
  },
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    p: 3,
    gap: 2,
    mt: -6,
    position: 'relative',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    border: '4px solid white',
  },
  avatarCameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1976d2',
    color: 'white',
    width: 32,
    height: 32,
    '&:hover': {
      backgroundColor: '#1565c0',
    },
  },
};

// Section Common Styles
export const sectionCommonStyles = {
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
  },
};

// Information Section Styles
export const informationSectionStyles = {
  gridContainer: sectionCommonStyles.gridContainer,
};

// Certification Section Styles
export const certificationSectionStyles = {
  gridContainer: sectionCommonStyles.gridContainer,
  certImage: {
    height: 300,
    bgcolor: '#E8EEF2',
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  certImageTag: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    bgcolor: 'white',
  },
};

// Profile Settings Section Styles
export const profileSettingsSectionStyles = {
  gridContainer: sectionCommonStyles.gridContainer,
};

// Security Section Styles
export const securitySectionStyles = {
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    bgcolor: '#F5E6E0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  usernameEditContainer: {
    display: 'flex',
    gap: 2,
    mt: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: { xs: 'column', sm: 'row' },
  },
  usernameButtonBox: {
    display: 'flex',
    gap: 2,
    sx: { width: { xs: '100%', sm: 'auto' } },
  },
  otpInputBox: {
    display: 'flex',
    gap: 1,
    justifyContent: 'space-between',
    mb: 3,
  },
  otpInput: {
    width: 45,
    height: 45,
    '& input': {
      textAlign: 'center',
      fontSize: '24px',
      fontWeight: 'bold',
    },
  },
  passwordFieldContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  visibilityButton: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
  },
};

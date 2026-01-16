export const ReviewTestPageStyles = {
  mainContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'background.default',
  },
  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 24px',
    flex: 1,
    width: '100%',
  },
  welcomeHeader: {
    marginBottom: '32px',
    backgroundColor: 'background.paper',
    borderRadius: '25px',
    padding: { xs: '20px', md: '32px' },
    width: '100%',
  },
  welcomeTitle: {
    fontSize: { xs: '1.5rem', sm: '1.7rem', md: '2rem' },
    fontWeight: 500,
    color: 'primary.dark',
    marginBottom: '8px',
    marginLeft: { xs: '0px', sm: '10px' },
  },
  welcomeSub: {
    color: 'darkGrey.light',
    marginBottom: '24px',
    marginLeft: { xs: '0px', sm: '10px' },
    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
  },
  statBadge: (variant) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    padding: '12px 24px',
    borderRadius: '24px',
    // Màu nền nhạt (Light green)
    backgroundColor:
      variant === 'green'
        ? 'success.pastel'
        : variant === 'yellow'
          ? 'warning.pastel'
          : 'purple.pastel',
    minWidth: '240px',
  }),
  iconWrapper: (variant) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    color: '#fff',
    // Màu icon đậm (Solid green)
    backgroundColor:
      variant === 'green'
        ? 'success.light'
        : variant === 'yellow'
          ? 'warning.light'
          : 'purple.light',
  }),
  statValue: {
    fontSize: '1.8rem',
    fontWeight: 600,
    color: '#000',
    lineHeight: 1.1,
  },
  statLabel: {
    fontSize: '1.1rem',
    //fontWeight: 500,
    color: '#1A202C',
    whiteSpace: 'nowrap',
  },

  switcherWrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
  switcher: {
    display: 'inline-flex',
    backgroundColor: 'primary.contrastText',
    borderRadius: 999,
    p: 0.5,
    gap: 0.5,
    mx: 'auto',
  },
  switchButton: {
    borderRadius: 999,
    px: 2.5,
    py: 0.75,
    //fontWeight: 600,
    color: 'primary.dark',
    textTransform: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  switchActive: {
    backgroundColor: 'yellow.main',
    color: 'primary.contrastText',
    boxShadow: (theme) => `0 10px 20px ${theme.palette.yellow.main}73`,
  },

  filterSection: {
    display: 'flex',
    flexDirection: { xs: 'column', lg: 'row' },
    gap: 2,
    marginBottom: '32px',
    alignItems: { xs: 'stretch', lg: 'center' },
  },
  searchInput: {
    flex: { xs: 'none', lg: 1 },
    maxWidth: '1200px',
    backgroundColor: 'background.paper',
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      '& fieldset': { borderColor: 'background.paper' },
    },
    borderRadius: '12px',
  },
  selectFilter: {
    flex: {
      xs: 'calc(50% - 8px)',
      sm: 'calc(20% - 12px)',
      lg: 'none',
    },
    minWidth: { xs: '100%', sm: '150px', lg: '150px' },
    backgroundColor: 'background.paper',
    borderRadius: '12px',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'background.paper' },
  },
};

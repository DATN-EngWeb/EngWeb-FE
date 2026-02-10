export const roleModalStyles = {
  dialogPaper: {
    borderRadius: '16px',
    border: '2px solid',
    borderColor: 'primary.main',
    backgroundColor: 'background.default',
    maxWidth: '600px',
  },
  dialogContent: {
    px: 6,
    py: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: 'text.primary',
    textAlign: 'center',
    mb: 2,
  },
  cardsContainer: {
    display: 'flex',
    gap: 3,
    width: '100%',
    justifyContent: 'center',
    flexDirection: { xs: 'column', sm: 'row' },
  },
  card: {
    flex: 1,
    minWidth: { xs: '100%', sm: '200px' },
    backgroundColor: 'background.paper',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: '12px',
    cursor: 'pointer',

    '&:active': {
      transform: 'translateY(-2px)',
    },
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    p: 3,
    '&:last-child': {
      paddingBottom: 3,
    },
  },
  iconContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    mb: 1,
  },
  icon: {
    objectFit: 'contain',
  },
  roleButton: {
    backgroundColor: 'primary.main',
    color: 'primary.contrastText',
    fontWeight: 600,
    borderRadius: '8px',
    py: 1.5,
    px: 3,
    textTransform: 'none',
    fontSize: '1rem',
    boxShadow: 'none',
  },
};

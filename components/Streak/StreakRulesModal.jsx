import React, { useEffect, useState } from 'react';
import {
  DialogContent,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { getStreakRewardRules } from '../../api/userProgress';

export default function StreakRulesModal({ open, onClose }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      fetchRules();
    }
  }, [open]);

  const fetchRules = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStreakRewardRules();

      // Assume data is an array of rules. If it's paginated, adjust accordingly.
      const rulesList = Array.isArray(data) ? data : data.results || [];

      // Sort by streak_day ascending
      const sortedRules = [...rulesList].sort((a, b) => a.streak_day - b.streak_day);
      setRules(sortedRules);
    } catch (err) {
      console.error('Failed to fetch streak reward rules:', err);
      setError('Failed to load streak rewards. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          padding: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          pt: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          sx={{ fontWeight: 800, color: 'primary.main', fontFamily: '"Outfit", sans-serif' }}
        >
          Streak Rewards
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            '&:hover': { backgroundColor: 'grey.100', color: 'text.primary' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 3 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Maintain your learning streak to unlock exclusive rewards and level up your AI credits!
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: '12px' }}>
            {error}
          </Alert>
        ) : rules.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 3, bgcolor: '#f8fafc', borderRadius: '16px' }}>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              No rewards found. Start learning to build your streak!
            </Typography>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: '1px solid #e2e8f0', borderRadius: '12px' }}
          >
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    Streak Days
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textAlign: 'center' }}>
                    XP Reward
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textAlign: 'center' }}>
                    AI Turns
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{rule.streak_day} Days</TableCell>
                    <TableCell align="center">
                      {rule.xp_reward > 0 ? (
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: '#d97706',
                          }}
                        >
                          <StarRoundedIcon fontSize="small" />
                          <Typography variant="body2" fontWeight="bold">
                            +{rule.xp_reward}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {rule.ai_turn_reward > 0 ? (
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: 'info.dark',
                          }}
                        >
                          <AutoAwesomeIcon fontSize="small" />
                          <Typography variant="body2" fontWeight="bold">
                            +{rule.ai_turn_reward}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          -
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );
}

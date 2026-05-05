'use client';
import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Button,
  IconButton,
  Stack,
  Box,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import ShareIcon from '@mui/icons-material/Share';
import * as styles from '@/styles/Student/HistoryTestStyles';
import { formatDate } from '../../utils/stringFormat';

const formatTime = (totalSeconds) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const wordCount = (data) => {
  const text = data?.user_answer_text ?? '';
  return text.trim() ? text.trim().split(/\s+/).length : 0;
};

export default function HistoryTable({ data, skill, onViewDetail, onShare, onOpenAIReviewed }) {
  return (
    <TableContainer sx={styles.tableContainer}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={styles.tableHead}>
          <TableRow>
            <TableCell>DATE</TableCell>
            {skill === 'L' ? (
              <>
                <TableCell>SCORE</TableCell>
                <TableCell>XP</TableCell>
              </>
            ) : (
              <>
                <TableCell>STATUS</TableCell>
                <TableCell>BONUS POINT</TableCell>
              </>
            )}
            <TableCell>DETAILS</TableCell>
            <TableCell align="right">ACTIONS</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <TableRow key={index} sx={styles.tableRow}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={800} color="text.secondary">
                    {item.end_time && formatDate(item.end_time)}
                  </Typography>
                </TableCell>
                {/* Conditional Column for Status or Total Score */}
                {skill === 'L' ? (
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={800} color="primary">
                      {item.total_score ?? 0}
                    </Typography>
                  </TableCell>
                ) : (
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {item.is_shared && (
                        <Chip
                          label="SHARED"
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            bgcolor: '#e3f2fd',
                            color: '#1976d2',
                          }}
                        />
                      )}
                      {item.ai_feedback && item.type === 'S' && (
                        <Chip
                          label="AI REVIEWED"
                          size="small"
                          onClick={onOpenAIReviewed ? () => onOpenAIReviewed(item) : undefined}
                          sx={{
                            height: 20,
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            bgcolor: '#f3e5f5',
                            color: '#9c27b0',
                            cursor: onOpenAIReviewed ? 'pointer' : 'default',
                          }}
                        />
                      )}
                    </Stack>
                  </TableCell>
                )}

                {/* XP Column */}
                <TableCell>
                  <Typography
                    variant="caption"
                    fontWeight={800}
                    color="#ffb300"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.85rem' }}
                  >
                    <StarIcon sx={{ fontSize: '1rem' }} /> {item.earned_bonus_point || 0} XP
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={2}>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color="text.secondary"
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <AccessTimeIcon sx={{ fontSize: '1rem' }} /> {formatTime(item.total_time)}{' '}
                      mins
                    </Typography>
                    {skill === 'W' && (
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        color="text.secondary"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        <DescriptionIcon sx={{ fontSize: '1rem' }} /> {wordCount(item)} words
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        bgcolor: '#f5f5f5',
                        color: '#4e342e',
                        boxShadow: 'none',
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: '8px',
                        '&:hover': { bgcolor: '#eeeeee' },
                      }}
                      onClick={() => onViewDetail(item)}
                    >
                      View Detail
                    </Button>
                    {onShare && (
                      <IconButton
                        size="small"
                        sx={{ bgcolor: '#f5f5f5' }}
                        onClick={() => onShare(item)}
                      >
                        <ShareIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                <Typography
                  variant="body1"
                  fontWeight={700}
                  sx={{ color: 'text.secondary', mb: 1 }}
                >
                  You haven't submitted any responses yet.
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                  Start your first attempt to track your performance!
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

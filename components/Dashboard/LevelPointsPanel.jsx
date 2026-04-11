'use client';

import { useState } from 'react';
import {
  Typography,
  Button,
  Box,
  Paper,
  Stack,
  Chip,
  LinearProgress,
  Divider,
} from '@mui/material';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';

const LEVEL_STATUS = {
  CURRENT: 'current',
  ACHIEVED: 'achieved',
  LOCKED: 'locked',
};

const getLevelStatus = (level, currentLevelId, cumulativePoint) => {
  if (!level) return LEVEL_STATUS.LOCKED;
  if (level.id === currentLevelId) return LEVEL_STATUS.CURRENT;
  if (cumulativePoint >= (level.max_xp || 0)) return LEVEL_STATUS.ACHIEVED;
  return LEVEL_STATUS.LOCKED;
};

const getStatusChip = (status) => {
  if (status === LEVEL_STATUS.ACHIEVED) {
    return { label: 'Achieved', color: 'success' };
  }

  return null;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function LevelPointsPanel({
  isLevelLoading,
  currentLevel,
  cumulativePoint,
  currentLevelProgress,
  nextLevel,
  pointsToNextLevel,
  sortedLevels,
  currentLevelId,
}) {
  const [showAllLevels, setShowAllLevels] = useState(false);

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        p: 2.25,
        borderRadius: '1.25rem',
        boxShadow: 'none',
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.100',
              color: 'text.primary',
              flexShrink: 0,
            }}
          >
            <EmojiEventsOutlinedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 900, color: 'primary.main', lineHeight: 1.1, marginBottom: 0.5 }}
            >
              Level & Points
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.5 }}
            >
              Track your current level and progress to the next milestone
            </Typography>
          </Box>
        </Stack>

        {isLevelLoading ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Loading level data...
          </Typography>
        ) : (
          <>
            <Paper
              variant="outlined"
              sx={{
                p: 1.4,
                borderRadius: 3,
                bgcolor: 'background.default',
                borderColor: 'divider',
              }}
            >
              <Stack spacing={0.9}>
                <Stack direction="row" spacing={0.9} alignItems="center">
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '9px',
                      bgcolor: 'background.paper',
                      border: '1px dashed',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {currentLevel?.level_icon ? (
                      <Box
                        component="img"
                        src={currentLevel.level_icon}
                        alt={`Level ${currentLevel.level_number} icon`}
                        sx={{ width: 16, height: 16, objectFit: 'contain' }}
                      />
                    ) : (
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontWeight: 700 }}
                      >
                        ICON
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      Current level
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main' }}>
                      {currentLevel
                        ? `Level ${currentLevel.level_number} - ${currentLevel.level_title}`
                        : 'No level yet'}
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ position: 'relative', width: '100%' }}>
                  <LinearProgress
                    variant="determinate"
                    value={currentLevel ? currentLevelProgress : 0}
                    sx={{
                      height: 22,
                      borderRadius: 999,
                      bgcolor: 'grey.300',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 999,
                      },
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      width: `${currentLevel ? currentLevelProgress : 0}%`,
                      overflow: 'hidden',
                      borderRadius: 999,
                      pointerEvents: 'none',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        color: '#fff',
                        letterSpacing: 0.1,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cumulativePoint.toLocaleString()} XP
                    </Typography>
                  </Box>
                </Box>

                {currentLevel && (
                  <>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        fontStyle: 'italic',
                      }}
                    >
                      {nextLevel
                        ? `${pointsToNextLevel.toLocaleString()} XP to Level ${nextLevel.level_number} - ${nextLevel.level_title}`
                        : 'Max level reached'}
                    </Typography>
                  </>
                )}
              </Stack>
            </Paper>

            <Divider />

            <Stack spacing={1.2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                <Typography variant="body1" sx={{ fontWeight: 800 }}>
                  All levels
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  disableElevation
                  onClick={() => setShowAllLevels((current) => !current)}
                  sx={{ fontWeight: 800, borderRadius: 999, textTransform: 'none' }}
                >
                  {showAllLevels ? 'Hide levels' : 'Show all levels'}
                </Button>
              </Stack>

              {showAllLevels ? (
                sortedLevels.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No level data available.
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      maxHeight: '320px',
                      overflowY: 'auto',
                      pr: 0.5,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    {sortedLevels.map((levelItem) => {
                      const status = getLevelStatus(levelItem, currentLevelId, cumulativePoint);
                      const chip = getStatusChip(status);
                      const minXp = levelItem.min_xp || 0;
                      const maxXp = levelItem.max_xp || 0;

                      return (
                        <Paper
                          key={levelItem.id}
                          variant="outlined"
                          sx={{
                            p: 1.5,
                            borderRadius: 2.5,
                            borderColor: 'divider',
                            bgcolor:
                              status === LEVEL_STATUS.CURRENT
                                ? 'background.default'
                                : 'background.paper',
                          }}
                        >
                          <Stack spacing={1}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="flex-start"
                              gap={1}
                            >
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                                  Level {levelItem.level_number} - {levelItem.level_title}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '10px',
                                  bgcolor: 'background.paper',
                                  border: '1px dashed',
                                  borderColor: 'divider',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                {levelItem.level_icon ? (
                                  <Box
                                    component="img"
                                    src={levelItem.level_icon}
                                    alt={`Level ${levelItem.level_number} icon`}
                                    sx={{ width: 14, height: 14, objectFit: 'contain' }}
                                  />
                                ) : (
                                  <Typography
                                    variant="caption"
                                    sx={{ color: 'text.secondary', fontWeight: 700 }}
                                  >
                                    IMG
                                  </Typography>
                                )}
                              </Box>
                            </Stack>

                            <Stack spacing={0.5}>
                              <LinearProgress
                                variant="determinate"
                                value={100}
                                sx={{
                                  height: 7,
                                  borderRadius: 999,
                                  bgcolor: 'grey.200',
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 999,
                                    bgcolor: 'grey.400',
                                  },
                                }}
                              />
                              <Box
                                sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{ color: 'text.secondary', fontWeight: 700 }}
                                >
                                  {minXp.toLocaleString()}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: 'text.secondary', fontWeight: 700 }}
                                >
                                  {maxXp.toLocaleString()}
                                </Typography>
                              </Box>
                            </Stack>

                            {chip && (
                              <Chip
                                label={chip.label}
                                color={chip.color}
                                size="small"
                                variant={status === LEVEL_STATUS.CURRENT ? 'filled' : 'outlined'}
                                sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
                              />
                            )}
                          </Stack>
                        </Paper>
                      );
                    })}
                  </Box>
                )
              ) : null}
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  );
}

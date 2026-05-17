/* global setInterval, clearInterval, performance, requestAnimationFrame, cancelAnimationFrame */
'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import PercentIcon from '@mui/icons-material/Percent';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { getQuotesForTestType, fadeUp, ConfettiCanvas, LoadingOrb } from './SharedDialogUtils';

// ─── Level-up confetti burst (canvas, local to the progress bar area) ─────────

function LevelUpConfetti() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#fff'];
    const TOTAL = 80;

    const particles = Array.from({ length: TOTAL }, () => ({
      x: Math.random() * W,
      y: H + Math.random() * 20,
      r: Math.random() * 5 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: (Math.random() - 0.5) * 3,
      vy: -(Math.random() * 5 + 3),
      alpha: 1,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.2,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }));

    let frame;
    const startTime = performance.now();
    const delay = 1200; // wait 1.2s for the progress bar to finish animating

    const draw = (now) => {
      if (now - startTime < delay) {
        frame = requestAnimationFrame(draw);
        return;
      }
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // gravity
        p.alpha -= 0.012;
        p.rotation += p.rotSpeed;
        if (p.alpha <= 0) continue;
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(p.alpha, 0);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      if (alive) frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        borderRadius: 4,
      }}
    />
  );
}

// ─── Submitting state ─────────────────────────────────────────────────────────

function SubmittingState() {
  return (
    <Stack spacing={2.25} alignItems="center" textAlign="center" py={1}>
      <LoadingOrb icon={UploadFileIcon} />

      <Box>
        <Typography variant="h6" fontWeight={700}>
          Submitting your test...
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5} lineHeight={1.65}>
          System is saving your work.
          <br />
          Please do not close or refresh the page.
        </Typography>
      </Box>

      <Box width="100%">
        <LinearProgress
          sx={{
            height: 4,
            borderRadius: 99,
            bgcolor: 'grey.100',
            '& .MuiLinearProgress-bar': { borderRadius: 99, bgcolor: 'primary.main' },
          }}
        />
        <Typography
          variant="caption"
          color="text.disabled"
          display="block"
          textAlign="center"
          mt={0.75}
          sx={{
            animation: 'blink 1.8s ease-in-out infinite',
            '@keyframes blink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
          }}
        >
          Processing, please wait...
        </Typography>
      </Box>
    </Stack>
  );
}

// ─── Submitted state ──────────────────────────────────────────────────────────

function SubmittedState({
  score,
  total,
  timeTaken,
  xpEarned,
  xpBonus = 0,
  currentXP,
  levelMaxXP,
  level,
  levelIcon,
  levelTitle,
  leveledUp = false,
  testType,
  onViewResults,
  onContinue,
  onClose,
}) {
  const [xpCount, setXpCount] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [quote] = useState(() => {
    const quotes = getQuotesForTestType(testType);
    return quotes[Math.floor(Math.random() * quotes.length)];
  });

  const actualEarned = xpEarned || 0;
  const actualBonus = xpBonus > 0 ? xpBonus : 0;
  const totalXP = actualEarned + actualBonus;

  const progressAfter = levelMaxXP
    ? Math.min((((currentXP || 0) + totalXP) / levelMaxXP) * 100, 100)
    : 0;
  const pct = score !== undefined && total ? Math.round((score / total) * 100) : 0;

  const theme = useTheme();

  useEffect(() => {
    let current = 0;
    const step = Math.ceil(totalXP / 40);
    const id = setInterval(() => {
      current = Math.min(current + step, totalXP);
      setXpCount(current);
      if (current >= totalXP) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [totalXP]);

  // Show progress after first paint to trigger CSS transition
  useEffect(() => {
    let frame2;
    const frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => setShowProgress(true));
    });
    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
    };
  }, []);

  const stats = [];
  if (score !== undefined && total !== undefined) {
    stats.push({
      icon: <CheckCircleOutlineIcon sx={{ fontSize: 15, color: 'success.main' }} />,
      value: `${score}/${total}`,
      label: 'Correct',
      color: 'success.main',
    });
    stats.push({
      icon: <PercentIcon sx={{ fontSize: 15 }} />,
      value: `${pct}%`,
      label: 'Score',
      color: 'text.primary',
    });
  }
  if (timeTaken) {
    stats.push({
      icon: <TimerOutlinedIcon sx={{ fontSize: 15, color: 'warning.dark' }} />,
      value: timeTaken,
      label: 'Time',
      color: 'warning.dark',
    });
  }

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      <ConfettiCanvas />

      <Stack
        spacing={2}
        alignItems="center"
        textAlign="center"
        py={1}
        sx={{ position: 'relative', zIndex: 1 }}
      >
        {/* Trophy */}
        <Box
          sx={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            bgcolor: 'action.hover',
            border: '2px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
            '@keyframes popIn': {
              from: { transform: 'scale(0.4)', opacity: 0 },
              to: { transform: 'scale(1)', opacity: 1 },
            },
          }}
        >
          <EmojiEventsIcon sx={{ fontSize: 52, color: 'primary.main' }} />
        </Box>

        {/* Labels */}
        <Box sx={fadeUp(300, '0.4s', '10px')}>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.12em' }}>
            Test complete
          </Typography>
          <Typography variant="h5" fontWeight={700} mt={0.25}>
            Outstanding work!
          </Typography>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            maxWidth: 320,
            lineHeight: 1.7,
            fontStyle: 'italic',
            ...fadeUp(450, '0.4s', '10px'),
          }}
        >
          "{quote}"
        </Typography>

        {/* XP badge */}
        {(actualEarned > 0 || actualBonus > 0) && (
          <Paper
            variant="outlined"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: 1.25,
              borderRadius: 3,
              width: '100%',
              ...fadeUp(600, '0.4s', '10px'),
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <StarIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            </Box>
            <Box textAlign="left">
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                XP earned this session
              </Typography>
              <Stack direction="row" alignItems="baseline" spacing={0.75}>
                <Typography variant="h6" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                  {xpCount} XP
                </Typography>
                {/* {actualBonus > 0 && (
                  <Chip
                    label={`+${actualBonus} bonus`}
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.dark',
                      fontWeight: 600,
                      fontSize: 11,
                      height: 20,
                    }}
                  />
                )} */}
              </Stack>
            </Box>
          </Paper>
        )}

        {/* Stats strip */}
        {stats.length > 0 && (
          <Stack
            direction="row"
            spacing={1.25}
            sx={{ width: '100%', ...fadeUp(750, '0.4s', '10px') }}
          >
            {stats.map(({ icon, value, label, color }) => (
              <Paper
                key={label}
                variant="outlined"
                sx={{ flex: 1, px: 1.5, py: 1.25, borderRadius: 2, textAlign: 'center' }}
              >
                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  spacing={0.5}
                  mb={0.25}
                >
                  {icon}
                  <Typography variant="subtitle2" fontWeight={600} color={color}>
                    {value}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {label}
                </Typography>
              </Paper>
            ))}
          </Stack>
        )}

        {/* Level progress */}
        {level !== undefined && levelMaxXP !== undefined && currentXP !== undefined && (
          <Box sx={{ width: '100%', ...fadeUp(900, '0.4s', '10px') }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                {levelIcon && (
                  <Box
                    component="img"
                    src={levelIcon}
                    alt={levelTitle || `Level ${level}`}
                    sx={{ width: 18, height: 18, objectFit: 'contain' }}
                  />
                )}
                <Typography variant="caption" color="text.secondary">
                  Level {level} {levelTitle ? `- ${levelTitle}` : ''}
                </Typography>
                {/* Level-up badge */}
                {leveledUp && (
                  <Chip
                    label="🎉 Level Up!"
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.warning.main, 0.15),
                      color: 'warning.dark',
                      fontWeight: 700,
                      fontSize: 11,
                      height: 20,
                      animation: 'badgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
                      animationDelay: '1.2s',
                      '@keyframes badgePop': {
                        from: { transform: 'scale(0)', opacity: 0 },
                        to: { transform: 'scale(1)', opacity: 1 },
                      },
                    }}
                  />
                )}
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {Math.min(currentXP + totalXP, levelMaxXP)} / {levelMaxXP} XP
              </Typography>
            </Stack>

            {/* Progress bar wrapper — confetti is positioned relative to this */}
            <Box sx={{ position: 'relative' }}>
              <LinearProgress
                variant="determinate"
                value={showProgress ? progressAfter : (currentXP / levelMaxXP) * 100}
                sx={{
                  height: 7,
                  borderRadius: 4,
                  bgcolor: 'action.hover',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: leveledUp ? 'warning.main' : 'primary.main',
                    borderRadius: 4,
                    transition: 'transform 1.2s cubic-bezier(0.16,1,0.3,1) !important',
                  },
                }}
              />
              {/* Confetti burst fires immediately when leveledUp */}
              {leveledUp && <LevelUpConfetti />}
            </Box>
          </Box>
        )}

        {/* Actions */}
        <Stack direction="row" spacing={1.5} width="100%" sx={fadeUp(1000, '0.4s', '10px')}>
          {onViewResults && (
            <Button
              variant="outlined"
              fullWidth
              onClick={onViewResults}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              View results
            </Button>
          )}
          {onContinue && (
            <Button
              variant="contained"
              fullWidth
              onClick={onContinue}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' },
                boxShadow: 'none',
              }}
            >
              Close
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ onRetry, onClose }) {
  const theme = useTheme();
  return (
    <Stack spacing={2.25} alignItems="center" textAlign="center" py={1}>
      <Box
        sx={{
          animation: 'popIn .35s cubic-bezier(.34,1.56,.64,1)',
          '@keyframes popIn': {
            '0%': { transform: 'scale(0.3)', opacity: 0 },
            '70%': { transform: 'scale(1.1)' },
            '100%': { transform: 'scale(1)', opacity: 1 },
          },
        }}
      >
        <Box
          sx={{
            width: 76,
            height: 76,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.error.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <line
              x1="11"
              y1="11"
              x2="23"
              y2="23"
              stroke={theme.palette.error.main}
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <line
              x1="23"
              y1="11"
              x2="11"
              y2="23"
              stroke={theme.palette.error.main}
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </svg>
        </Box>
      </Box>
      <Box>
        <Typography variant="h6" fontWeight={700}>
          Submission failed
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5} lineHeight={1.65}>
          Something went wrong.
          <br />
          Your test was not submitted.
        </Typography>
      </Box>
      <Stack spacing={1} width="100%">
        {onRetry && (
          <Button
            variant="contained"
            fullWidth
            color="error"
            onClick={onRetry}
            sx={{
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 600,
              py: 1.1,
              boxShadow: 'none',
            }}
          >
            Try again
          </Button>
        )}
        {onClose && (
          <Button
            variant="outlined"
            fullWidth
            onClick={onClose}
            color="inherit"
            sx={{
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 400,
              borderColor: 'divider',
            }}
          >
            Cancel
          </Button>
        )}
      </Stack>
    </Stack>
  );
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

export default function SubmitLoadingDialog({
  status,
  score,
  total,
  timeTaken,
  xpEarned,
  xpBonus,
  bonusPoint,
  currentXP,
  levelMaxXP,
  level,
  levelIcon,
  levelTitle,
  leveledUp = false,
  testType,
  onViewResults,
  onContinue,
  onClose,
  onRetry,
}) {
  const open = Boolean(status && status !== 'idle');
  const actualBonus = xpBonus !== undefined ? xpBonus : bonusPoint !== undefined ? bonusPoint : 0;

  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth
      disableEscapeKeyDown={status === 'submitting' || !onClose}
      onClose={status !== 'submitting' ? onClose : undefined}
      TransitionProps={{ timeout: 220 }}
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: '20px',
          border: '0.5px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            display: 'block',
            height: 4,
            width: '100%',
            bgcolor:
              status === 'submitted'
                ? 'success.main'
                : status === 'error'
                  ? 'error.main'
                  : 'primary.main',
            transition: 'background-color 0.3s',
          },
        },
      }}
      slotProps={{
        backdrop: { sx: { backdropFilter: 'blur(3px)', bgcolor: 'rgba(0,0,0,0.35)' } },
      }}
    >
      <DialogContent sx={{ p: status === 'submitted' ? 0 : 3 }}>
        {status === 'submitting' && <SubmittingState />}
        {status === 'submitted' && (
          <Box sx={{ px: 3, pb: 3, pt: 2 }}>
            <SubmittedState
              score={score}
              total={total}
              timeTaken={timeTaken}
              xpEarned={xpEarned}
              xpBonus={actualBonus}
              currentXP={currentXP}
              levelMaxXP={levelMaxXP}
              level={level}
              levelIcon={levelIcon}
              levelTitle={levelTitle}
              leveledUp={leveledUp}
              testType={testType}
              onViewResults={onViewResults}
              onContinue={onContinue || onClose}
            />
          </Box>
        )}
        {status === 'error' && <ErrorState onRetry={onRetry} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

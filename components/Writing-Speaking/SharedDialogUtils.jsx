/* global requestAnimationFrame, cancelAnimationFrame */
'use client';

import { useEffect, useRef } from 'react';
import { Box, useTheme, alpha } from '@mui/material';

// ─── Shared Configurations ───────────────────────────────────────────────────

export const SPEAKING_QUOTES = [
  'Speech is silver, silence is gold, but action is diamond. — Proverb',
  'It is not because things are difficult that we do not dare; it is because we do not dare that they are difficult. — Seneca',
  'Courage is being scared to death, but saddling up anyway. — John Wayne',
  'Everything you’ve ever wanted is on the other side of fear. — George Addair',
  "Don't be afraid to be confused. Try to allow the confusion to sit and hover and breathe. — Martha Beck",
];

export const WRITING_QUOTES = [
  'A professional writer is an amateur who didn’t quit. — Richard Bach',
  'Ink and paper are sometimes more patient than people. — Adapted from Anne Frank',
  'Small daily improvements over time lead to stunning results. — Robin Sharma',
  'Consistency is the playground of dull minds, but the secret of masters. — Adapted',
  'The art of writing is the art of discovering what you believe. — Gustave Flaubert',
];

export const GENERAL_QUOTES = [
  'To have another language is to possess a second soul. — Charlemagne',
  'Language is the road map of a culture. — Rita Mae Brown',
  'Knowledge of languages is the doorway to wisdom. — Roger Bacon',
  'Words are, of course, the most powerful drug used by mankind. — Rudyard Kipling',
  'The limits of my language mean the limits of my world. — Ludwig Wittgenstein',
  'Do one thing every day that scares you. — Eleanor Roosevelt',
  "Don't watch the clock; do what it does. Keep going. — Sam Levenson",
  'The way to get started is to quit talking and begin doing. — Walt Disney',
  "You don't have to be great to start, but you have to start to be great. — Zig Ziglar",
  'Your only limit is your soul. — Ratatouille (Disney/Pixar)',
];

export const getQuotesForTestType = (type) => {
  if (type === 'speaking' || type === 'S') {
    return [...SPEAKING_QUOTES, ...GENERAL_QUOTES];
  } else if (type === 'writing' || type === 'W') {
    return [...WRITING_QUOTES, ...GENERAL_QUOTES];
  }
  return GENERAL_QUOTES;
};

export const fadeUp = (delay, duration = '0.5s', y = '12px') => ({
  animation: `fadeUp ${duration} ease-out ${delay}ms both`,
  '@keyframes fadeUp': {
    from: { opacity: 0, transform: `translateY(${y})` },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
});

// ─── Shared Components ───────────────────────────────────────────────────────

export function ConfettiCanvas() {
  const canvasRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.light,
      theme.palette.warning.light,
      theme.palette.info.light,
      theme.palette.error.light,
    ];
    const pieces = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 80,
      r: 4 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)] || theme.palette.primary.main,
      speed: 1.5 + Math.random() * 2.5,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.15,
      isCircle: Math.random() > 0.5,
    }));

    let frame;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - p.y / canvas.height);
        if (p.isCircle) {
          ctx.beginPath();
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
        }
        ctx.restore();
        p.y += p.speed;
        p.angle += p.spin;

        // Reset when it goes off screen
        if (p.y > canvas.height + p.r) {
          p.y = -p.r - Math.random() * 20;
          p.x = Math.random() * canvas.width;
        }
      });
      frame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}

export function LoadingOrb({ icon: IconComponent }) {
  return (
    <Box sx={{ position: 'relative', width: 76, height: 76 }}>
      <Box
        sx={{
          position: 'absolute',
          inset: -5,
          borderRadius: '50%',
          border: '2.5px solid transparent',
          borderTopColor: 'primary.main',
          animation: 'spin 0.9s linear infinite',
          '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
        }}
      />
      <Box
        sx={{
          width: 76,
          height: 76,
          borderRadius: '50%',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconComponent sx={{ fontSize: 30, color: 'primary.main' }} />
      </Box>
    </Box>
  );
}

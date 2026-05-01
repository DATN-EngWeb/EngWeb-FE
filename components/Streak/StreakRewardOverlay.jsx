'use client';

import React, { useEffect, useRef } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import gsap from 'gsap';
import theme from '../../theme/theme';
import { StreakSvgDefs } from './streakBadge';

const STREAK_MESSAGES = {
  beginner: [
    "You're off to a great start! 🚀",
    'The first step is always the hardest. Keep going!',
    'One day or Day One? You decided! 🔥',
    'Building a habit, one day at a time.',
    "Nice work! Don't let that flame go out.",
  ],

  pro: [
    "Look at you go! You're on a roll. 🌊",
    'Consistency is your middle name!',
    "Don't stop now, you're doing amazing! ✨",
    'Your future self will thank you for today.',
    'Is it hot in here, or is it just your streak? 🔥',
  ],

  legend: [
    "Legendary! You're officially unstoppable. 🏆",
    "A decade of days! You're crushing it.",
    "Pure dedication! You're in the top 1% now. 👑",
    'Streak level: GOD MODE. ⚡',
    'They should name a street after your streak!',
  ],

  funny: [
    'Your streak is longer than my last relationship! 💀',
    'Do you even sleep? Because this streak is insane!',
    "I'm just an AI, but even I'm impressed. 🤖",
    'Warning: This streak might cause excessive brilliance.',
    'Error 404: Laziness not found. Keep it up!',
  ],
};

const hexToRgb = (hex) => {
  const bigint = parseInt(hex.replace('#', ''), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
};

const getLevelColors = (level) => {
  const s = theme.palette.streak;
  const styles = {
    0: { main: s.gray, rgb: hexToRgb(s.gray), gradient: [s.gray, '#757575'] },
    1: { main: s.level1, rgb: hexToRgb(s.level1), gradient: [s.level1, '#e65100'] },
    2: { main: s.level2, rgb: hexToRgb(s.level2), gradient: [s.level2, '#ff8f00'] },
    3: { main: s.level3, rgb: hexToRgb(s.level3), gradient: [s.level3, '#cc0000'] },
    4: { main: s.level4, rgb: hexToRgb(s.level4), gradient: [s.level4, '#c2004d'] },
    5: { main: s.level5, rgb: hexToRgb(s.level5), gradient: [s.level5, '#aa00ff'] },
  };
  return styles[level] || styles[0];
};

const getLevelShadow = (level) => {
  const styles = {
    0: 'none',
    1: 'drop-shadow(0px 0px 20px rgba(255, 152, 0, 0.8))',
    2: 'drop-shadow(0px 0px 20px rgba(255, 187, 0, 0.8))',
    3: 'drop-shadow(0px 0px 20px rgba(213, 0, 47, 0.8))',
    4: 'drop-shadow(0px 0px 20px rgba(255, 0, 102, 0.8))',
    5: 'drop-shadow(0px 0px 20px rgba(180, 0, 255, 0.8))',
  };
  return styles[level] || styles[0];
};

export default function StreakRewardOverlay({ rewardData, onClose }) {
  const overlayRef = useRef(null);
  const flameRef = useRef(null);
  const contentRef = useRef(null);
  const rewardsRef = useRef(null);
  const btnRef = useRef(null);
  const lightRayRef = useRef(null);

  const quote = React.useMemo(() => {
    const days = rewardData?.streak_day || 1;
    let pool = [];

    // 20% chance to pick a funny message
    if (Math.random() < 0.2) {
      pool = STREAK_MESSAGES.funny;
    } else {
      if (days <= 3) pool = STREAK_MESSAGES.beginner;
      else if (days <= 9) pool = STREAK_MESSAGES.pro;
      else pool = STREAK_MESSAGES.legend;
    }

    return pool[Math.floor(Math.random() * pool.length)];
  }, [rewardData]);

  useEffect(() => {
    if (rewardData && overlayRef.current) {
      // Setup initial state
      gsap.set(overlayRef.current, { autoAlpha: 0 });
      gsap.set(flameRef.current, { scale: 0, opacity: 0, rotation: -30 });
      gsap.set(contentRef.current, { y: 50, opacity: 0 });
      gsap.set(rewardsRef.current.children, { scale: 0, opacity: 0 });
      gsap.set(btnRef.current, { y: 20, opacity: 0 });
      gsap.set(lightRayRef.current, { opacity: 0, scale: 0 });

      // Animation Timeline
      const tl = gsap.timeline();

      // Fade in background
      tl.to(overlayRef.current, { autoAlpha: 1, duration: 0.2, ease: 'power2.out' })

        // Ray animation scales up
        .to(
          lightRayRef.current,
          { opacity: 0.6, scale: 2, duration: 0.25, ease: 'power2.out' },
          '<',
        )

        // Pop in the flame
        .to(
          flameRef.current,
          { scale: 1.5, opacity: 1, rotation: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' },
          '<0.1',
        )

        // Text slide up
        .to(contentRef.current, { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }, '<0.2')

        // Pop in rewards one by one
        .to(
          rewardsRef.current.children,
          { scale: 1, opacity: 1, duration: 0.5, stagger: 0.2, ease: 'back.out(2)' },
          '<0.2',
        )

        // Button fade in
        .to(btnRef.current, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, '<0.3');

      // Independent infinite animations
      gsap.to(lightRayRef.current, { rotation: 360, duration: 20, repeat: -1, ease: 'linear' });
      gsap.to(flameRef.current, {
        y: -15,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.5, // Start floating after it pops in
      });
    }
  }, [rewardData]);

  const handleClose = () => {
    if (!overlayRef.current) {
      onClose();
      return;
    }
    gsap.to(overlayRef.current, {
      autoAlpha: 0,
      duration: 0.3,
      onComplete: onClose,
    });
  };

  if (!rewardData) return null;

  const currentLevel = rewardData.new_streak_milestone_id || 1;
  const shadow = getLevelShadow(currentLevel);
  const colors = getLevelColors(currentLevel);

  return (
    <Box
      ref={overlayRef}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backdropFilter: 'blur(8px)',
      }}
    >
      <StreakSvgDefs />

      {/* Rotating background light rays */}
      <Box
        ref={lightRayRef}
        sx={{
          position: 'absolute',
          width: '100vw',
          height: '100vw',
          background: `conic-gradient(from 0deg, transparent 0deg, rgba(${colors.rgb}, 0.2) 20deg, transparent 40deg, rgba(${colors.rgb}, 0.2) 60deg, transparent 80deg, rgba(${colors.rgb}, 0.2) 100deg, transparent 120deg, rgba(${colors.rgb}, 0.2) 140deg, transparent 160deg, rgba(${colors.rgb}, 0.2) 180deg, transparent 200deg, rgba(${colors.rgb}, 0.2) 220deg, transparent 240deg, rgba(${colors.rgb}, 0.2) 260deg, transparent 280deg, rgba(${colors.rgb}, 0.2) 300deg, transparent 320deg, rgba(${colors.rgb}, 0.2) 340deg, transparent 360deg)`,
          borderRadius: '50%',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      <IconButton
        onClick={handleClose}
        sx={{
          position: 'absolute',
          top: 24,
          right: 24,
          color: 'white',
          backgroundColor: 'rgba(255,255,255,0.1)',
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
        }}
      >
        <CloseIcon />
      </IconButton>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
        {/* Animated Flame Badge */}
        <Box
          ref={flameRef}
          sx={{
            width: { xs: 150, md: 220 },
            height: { xs: 150, md: 220 },
            filter: shadow,
            position: 'relative',
            mb: 4,
          }}
        >
          <Box component="svg" sx={{ position: 'absolute', width: '100%', height: '100%' }}>
            <use href={`#f${currentLevel}-out`} />
          </Box>
          <Box component="svg" sx={{ position: 'absolute', width: '100%', height: '100%' }}>
            <use href={`#f${currentLevel}-in`} />
          </Box>
        </Box>

        {/* Text Content */}
        <Box ref={contentRef} sx={{ textAlign: 'center', mb: 5, px: 2 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              color: 'white',
              fontFamily: '"Outfit", sans-serif',
              mb: 1,
              textShadow: '0px 4px 20px rgba(0,0,0,0.5)',
            }}
          >
            Milestone Reached!
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: '#ffb74d',
              fontWeight: 700,
              fontFamily: '"Outfit", sans-serif',
            }}
          >
            {rewardData.streak_day} Day Streak
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              fontStyle: 'italic',
              fontFamily: '"Outfit", sans-serif',
              mt: 2,
              maxWidth: '350px',
              mx: 'auto',
              lineHeight: 1.4,
              fontSize: '1.1rem',
            }}
          >
            "{quote}"
          </Typography>
        </Box>

        {/* Rewards Box */}
        <Box
          ref={rewardsRef}
          sx={{
            display: 'flex',
            gap: 3,
            mb: 6,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {rewardData.xp_reward > 0 && (
            <Box
              sx={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '20px',
                padding: '16px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '140px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              <StarRoundedIcon sx={{ fontSize: 40, color: '#ffca28', mb: 1 }} />
              <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '1.5rem' }}>
                +{rewardData.xp_reward}
              </Typography>
              <Typography
                sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontWeight: 600 }}
              >
                Bonus XP
              </Typography>
            </Box>
          )}

          {rewardData.ai_turn_reward > 0 && (
            <Box
              sx={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '20px',
                padding: '16px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '140px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 40, color: '#4fc3f7', mb: 1 }} />
              <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '1.5rem' }}>
                +{rewardData.ai_turn_reward}
              </Typography>
              <Typography
                sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontWeight: 600 }}
              >
                AI Turns
              </Typography>
            </Box>
          )}
        </Box>

        {/* Continue Button */}
        <Button
          ref={btnRef}
          variant="contained"
          onClick={handleClose}
          sx={{
            borderRadius: '50px',
            px: 6,
            py: 1.5,
            fontSize: '1.125rem',
            fontWeight: 800,
            textTransform: 'none',
            fontFamily: '"Outfit", sans-serif',
            background: `linear-gradient(45deg, ${colors.main} 30%, ${colors.gradient[1]} 90%)`,
            boxShadow: `0 3px 20px rgba(${colors.rgb}, 0.5)`,
            '&:hover': {
              background: `linear-gradient(45deg, ${colors.gradient[1]} 30%, ${colors.main} 90%)`,
              boxShadow: `0 6px 25px rgba(${colors.rgb}, 0.7)`,
            },
          }}
        >
          Close
        </Button>
      </Box>
    </Box>
  );
}

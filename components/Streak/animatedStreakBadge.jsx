/* eslint-disable no-undef */
'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { gsap } from 'gsap';
import { useStreakContext } from '../../context/streakContext';
import { useAuth } from '../../hooks/useAuth';

const getStreakLevel = (count) => {
  if (count >= 200) return 5;
  if (count >= 100) return 4;
  if (count >= 30) return 3;
  if (count >= 10) return 2;
  if (count > 3) return 1;
  return 1;
};

const levelConfigs = {
  1: { sparkColor: '#f27b0c' },
  2: { sparkColor: '#ffbb00' },
  3: { sparkColor: '#ff3333' },
  4: { sparkColor: '#ff0066' },
  5: { sparkColor: '#d966ff' },
};

export default function AnimatedStreakBadge({ size = 180 }) {
  const { isAuthenticated, user } = useAuth();
  const { streakData, isLoading } = useStreakContext();

  const [isVisible, setIsVisible] = useState(false);
  const hasCelebratedRef = useRef(false);

  const overlayRef = useRef(null);
  const flameRef = useRef(null);
  const textRef = useRef(null);
  const sparkContainerRef = useRef(null);

  const outerLayerRef = useRef(null);
  const innerLayerRef = useRef(null);

  const swayTweens = useRef([]);

  const streak_count = streakData?.streak_count || 0;
  const is_streak_lit_today = streakData?.is_streak_lit_today;

  const currentLevel = getStreakLevel(streak_count);
  const config = levelConfigs[currentLevel] || levelConfigs[1];

  useEffect(() => {
    if (isLoading || !isAuthenticated || user?.role !== 'S' || !is_streak_lit_today) return;

    const isMilestone = streak_count === 100 || streak_count === 200;
    if (!isMilestone) return;

    const storageKey = `celebrated_streak_${streak_count}`;
    const hasCelebratedStorage = localStorage.getItem(storageKey);

    if (!hasCelebratedRef.current && !hasCelebratedStorage) {
      hasCelebratedRef.current = true;
      localStorage.setItem(storageKey, 'true');
      setIsVisible(true);
    }
  }, [streak_count, is_streak_lit_today, isLoading, isAuthenticated, user]);

  // HÀM TẠO TIA LỬA (Dịch từ script JS gốc của bạn)
  const createSpark = useCallback(
    (isBurst = false) => {
      if (!sparkContainerRef.current) return;

      const spark = document.createElement('div');
      sparkContainerRef.current.appendChild(spark);

      const sizePx = isBurst ? Math.random() * 8 + 4 : Math.random() * 5 + 2;
      Object.assign(spark.style, {
        position: 'absolute',
        bottom: '15%',
        left: '50%',
        width: `${sizePx}px`,
        height: `${sizePx}px`,
        backgroundColor: config.sparkColor,
        borderRadius: '50%',
        pointerEvents: 'none',
        mixBlendMode: 'screen',
        boxShadow: `0 0 ${sizePx * 2}px ${config.sparkColor}, 0 0 ${sizePx * 5}px ${config.sparkColor}`,
        zIndex: 10,
      });

      const startX = (Math.random() - 0.5) * (size * 0.8);
      const startY = (Math.random() - 0.5) * (size * 0.2);

      gsap.set(spark, { x: startX, y: startY, opacity: 1, scale: 1 });

      const flyHeight = isBurst
        ? -(Math.random() * size * 1.5 + size * 0.5)
        : -(Math.random() * size * 0.8 + size * 0.3);
      const driftX = startX + (Math.random() - 0.5) * size * 1.5;

      gsap.to(spark, {
        y: flyHeight,
        x: driftX,
        opacity: 0,
        scale: 0,
        duration: Math.random() * 0.8 + (isBurst ? 0.3 : 0.6),
        ease: isBurst ? 'circ.out' : 'power1.out',
        onComplete: () => {
          if (sparkContainerRef.current?.contains(spark)) spark.remove();
        },
      });
    },
    [config.sparkColor, size],
  );

  // HÀM LẮC LƯ HỮU CƠ (Bê nguyên từ startSway của bạn)
  const startSway = useCallback(() => {
    if (!outerLayerRef.current || !innerLayerRef.current) return;

    // Xóa các tween cũ nếu có
    swayTweens.current.forEach((t) => t.kill());
    swayTweens.current = [];

    const baseDuration = 1.1 + Math.random() * 0.4;
    const startDir = 1; // Mặc định hướng 1
    const innerDir = startDir * -1;

    // Lớp ngoài
    swayTweens.current.push(
      gsap.to(outerLayerRef.current, {
        rotation: 4 * startDir,
        duration: baseDuration,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 0.3,
      }),
    );
    swayTweens.current.push(
      gsap.to(outerLayerRef.current, {
        scaleY: 1.04,
        scaleX: 0.96,
        duration: baseDuration * 0.85,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      }),
    );

    // Lớp trong
    swayTweens.current.push(
      gsap.to(innerLayerRef.current, {
        rotation: 2.5 * innerDir,
        duration: baseDuration * 0.9,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 0.3,
      }),
    );
    swayTweens.current.push(
      gsap.to(innerLayerRef.current, {
        scaleY: 1.03,
        scaleX: 0.97,
        duration: baseDuration * 0.75,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      }),
    );
  }, []);

  // ĐIỀU PHỐI ANIMATION CHÍNH
  useEffect(() => {
    if (
      !isVisible ||
      !overlayRef.current ||
      !outerLayerRef.current ||
      !innerLayerRef.current ||
      !textRef.current
    )
      return;

    // 1. Setup tâm xoay cho lửa
    gsap.set([outerLayerRef.current, innerLayerRef.current], { transformOrigin: 'bottom center' });

    // 2. Fade in nền đen
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'power2.out' },
    );

    // 3. LỚP NGOÀI BÙNG LÊN (Giống hệt hover event của JS)
    gsap.fromTo(
      outerLayerRef.current,
      { scaleY: 0.2, scaleX: 0.6, opacity: 0, rotation: 0 },
      { scaleY: 1, scaleX: 1, opacity: 1, duration: 0.7, ease: 'expo.out', delay: 0.2 },
    );

    // 4. LỚP TRONG BÙNG LÊN & GỌI LẮC LƯ (startSway) SAU KHI XONG
    gsap.fromTo(
      innerLayerRef.current,
      { scaleY: 0.1, scaleX: 0.4, opacity: 0, rotation: 0 },
      {
        scaleY: 1,
        scaleX: 1,
        opacity: 1,
        duration: 0.8,
        ease: 'expo.out',
        delay: 0.25,
        onComplete: startSway, // <--- Điểm mấu chốt: Bùng xong thì bắt đầu lắc
      },
    );

    // 5. Bắn tia lửa (Burst)
    for (let i = 0; i < 40; i++) {
      setTimeout(() => createSpark(true), 200 + Math.random() * 400);
    }

    // 6. CHỮ NHẢY NHẢY (Bouncing)
    gsap.fromTo(
      textRef.current,
      { y: 0, scale: 1 },
      {
        y: -15,
        scale: 1.05,
        duration: 0.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 0.6,
      },
    );

    // Cháy âm ỉ (Interval tia lửa)
    const interval = setInterval(() => {
      if (Math.random() > 0.3) createSpark(false);
      if (Math.random() > 0.8) createSpark(false);
    }, 150);

    // Tự động đóng sau 4 giây
    setTimeout(() => {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.inOut',
        onComplete: () => setIsVisible(false),
      });
    }, 4000);

    // Dọn dẹp RAM khi tắt
    return () => {
      clearInterval(interval);
      gsap.killTweensOf([
        outerLayerRef.current,
        innerLayerRef.current,
        textRef.current,
        overlayRef.current,
      ]);
      swayTweens.current.forEach((t) => t.kill());
    };
  }, [isVisible, createSpark, startSway]);

  if (!isVisible) return null;

  return (
    <>
      {/* OVERLAY */}
      <Box
        ref={overlayRef}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* SVG */}
          <Box
            ref={flameRef}
            sx={{
              position: 'relative',
              width: size,
              height: size,
              filter: `drop-shadow(0 0 40px ${config.sparkColor})`,
            }}
          >
            {/* Lớp Outer */}
            <Box
              ref={outerLayerRef}
              component="svg"
              sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            >
              <use href={`#f${currentLevel}-out`} />
            </Box>
            {/* Lớp Inner */}
            <Box
              ref={innerLayerRef}
              component="svg"
              sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            >
              <use href={`#f${currentLevel}-in`} />
            </Box>
            {/* Chỗ để DOM sinh tia lửa */}
            <Box
              ref={sparkContainerRef}
              sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            />
          </Box>
          {/* Text */}
          <Box ref={textRef}>
            <Typography
              sx={{
                mt: 4,
                fontWeight: 900,
                fontSize: { xs: '2rem', md: '3rem' },
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                background: `linear-gradient(to right, #fff, ${config.sparkColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0px 4px 10px rgba(0,0,0,0.5))',
              }}
            >
              {streak_count} NGÀY LIÊN TIẾP!
            </Typography>
            <Typography
              sx={{
                color: '#aaa',
                fontSize: '1.2rem',
                mt: 1,
                fontWeight: 500,
                textAlign: 'center',
              }}
            >
              Bạn thật sự là một chiến thần!
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
}

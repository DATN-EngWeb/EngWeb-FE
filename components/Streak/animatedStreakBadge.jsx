/* eslint-disable no-undef */
'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { Box, Typography, Tooltip, CircularProgress } from '@mui/material';
import { gsap } from 'gsap';
import { useStreak } from '../../hooks/useStreak';
import { useAuth } from '../../hooks/useAuth';

// --- BẠN CÓ THỂ ĐỂ SvgDefs RA MỘT FILE RIÊNG ĐỂ DÙNG CHUNG CHO CẢ 2 COMPONENT ---
const StreakSvgDefs = () => (
  <svg
    width="0"
    height="0"
    style={{ display: 'none', position: 'absolute' }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient
        id="G-Center"
        gradientUnits="userSpaceOnUse"
        x1="1117.32"
        y1="807.421"
        x2="1096.08"
        y2="1731.73"
      >
        <stop offset="0" stopColor="rgb(255,241,1)" />
        <stop offset="1" stopColor="rgb(249,127,18)" />
      </linearGradient>
      <linearGradient
        id="G-Outer-Normal"
        gradientUnits="userSpaceOnUse"
        x1="1094.46"
        y1="1733.93"
        x2="1116.71"
        y2="515.311"
      >
        <stop offset="0" stopColor="rgb(176,5,18)" />
        <stop offset="1" stopColor="rgb(237,116,12)" />
      </linearGradient>
      <linearGradient
        id="G-Outer-Reverse"
        gradientUnits="userSpaceOnUse"
        x1="1094.46"
        y1="515.311"
        x2="1116.71"
        y2="1733.93"
      >
        <stop offset="0" stopColor="rgb(237,116,12)" />
        <stop offset="1" stopColor="rgb(176,5,18)" />
      </linearGradient>
      <linearGradient
        id="G-Outer-Level3"
        gradientUnits="userSpaceOnUse"
        x1="1101.73"
        y1="2174.68"
        x2="1094.74"
        y2="608.012"
      >
        <stop offset="0" stopColor="rgb(241,116,8)" />
        <stop offset="1" stopColor="rgb(213,0,47)" />
      </linearGradient>
      <linearGradient id="G-Outer-Level4" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ff3385" />
        <stop offset="40%" stopColor="#e6005c" />
        <stop offset="100%" stopColor="#330014" />
      </linearGradient>
      <linearGradient id="G-Center-Level4" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="30%" stopColor="#ffb3d1" />
        <stop offset="100%" stopColor="#ff0066" />
      </linearGradient>
      <linearGradient id="G-Outer-Level5" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ff33cc" />
        <stop offset="40%" stopColor="#9900cc" />
        <stop offset="100%" stopColor="#1a0033" />
      </linearGradient>
      <linearGradient id="G-Center-Level5" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="30%" stopColor="#ffb3ff" />
        <stop offset="100%" stopColor="#c400ff" />
      </linearGradient>
    </defs>
    <symbol id="f1-out" viewBox="0 0 2202 1952">
      <path
        fill="url(#G-Outer-Normal)"
        d="M 989.174 202.171 C 989.515 202.335... (Rút gọn để tập trung logic, bạn dán full path SVG của bạn vào đây)"
      />
    </symbol>
    <symbol id="f1-in" viewBox="0 0 2202 1952">
      <path fill="url(#G-Center)" d="M 799.044 1470.03... (Dán full path)" />
    </symbol>
    <symbol id="f2-out" viewBox="0 0 2076 2076">
      <path fill="url(#G-Outer-Reverse)" d="M 880.391... (Dán full path)" />
    </symbol>
    <symbol id="f2-in" viewBox="0 0 2076 2076">
      <path fill="url(#G-Center)" d="M 960.599... (Dán full path)" />
    </symbol>
    <symbol id="f3-out" viewBox="0 0 2240 2240">
      <g transform="translate(176.1, -86) scale(0.8428, 1)">
        <path fill="url(#G-Outer-Level3)" d="M 1056.19... (Dán full path)" />
      </g>
    </symbol>
    <symbol id="f3-in" viewBox="0 0 2240 2240">
      <g transform="translate(82, -4)">
        <path fill="url(#G-Center)" d="M 960.599... (Dán full path)" />
      </g>
    </symbol>
    <symbol id="f4-out" viewBox="0 0 2240 2240">
      <g transform="translate(176, 28)">
        <path fill="url(#G-Outer-Level4)" d="M1256.174... (Dán full path)" />
      </g>
    </symbol>
    <symbol id="f4-in" viewBox="0 0 2240 2240">
      <g transform="translate(82, -4)">
        <path fill="url(#G-Center-Level4)" d="M 960.599... (Dán full path)" />
      </g>
    </symbol>
    <symbol id="f5-out" viewBox="0 0 2240 2240">
      <g transform="translate(144, 41)">
        <path fill="url(#G-Outer-Level5)" d="M1649.678... (Dán full path)" />
      </g>
    </symbol>
    <symbol id="f5-in" viewBox="0 0 2240 2240">
      <g transform="translate(82, -4)">
        <path fill="url(#G-Center-Level5)" d="M 960.599... (Dán full path)" />
      </g>
    </symbol>
  </svg>
);

// Helper function và Config
const getStreakLevel = (count) => {
  if (count >= 200) return 5;
  if (count >= 100) return 4;
  if (count >= 30) return 3;
  if (count >= 10) return 2;
  return 1;
};

const levelConfigs = {
  1: {
    color: '#ff9800',
    sparkColor: '#f27b0c',
    shadow: 'drop-shadow(0 0 15px rgba(242, 123, 12, 0.4))',
  },
  2: {
    color: '#ffbb00',
    sparkColor: '#ffbb00',
    shadow: 'drop-shadow(0 0 20px rgba(255, 187, 0, 0.5))',
  },
  3: {
    color: '#d5002f',
    sparkColor: '#ff3333',
    shadow: 'drop-shadow(0 0 25px rgba(213, 0, 47, 0.6))',
  },
  4: {
    color: '#ff0066',
    sparkColor: '#ff0066',
    shadow: 'drop-shadow(0 0 30px rgba(255, 0, 102, 0.6))',
  },
  5: {
    color: '#b400ff',
    sparkColor: '#d966ff',
    shadow: 'drop-shadow(0 0 35px rgba(180, 0, 255, 0.6))',
  },
};

export default function AnimatedStreakBadge({
  size = 60, // Hỗ trợ truyền size vào để to/nhỏ tùy màn hình (Header nhỏ, Dashboard to)
  showText = true, // Có hiển thị con số bên cạnh không
}) {
  const { isAuthenticated, user } = useAuth();
  const { streakData, isLoading } = useStreak(isAuthenticated, user?.role);

  // Refs cho GSAP
  const containerRef = useRef(null);
  const outerLayerRef = useRef(null);
  const innerLayerRef = useRef(null);
  const sparkContainerRef = useRef(null);

  // Lưu trữ tween lắc lư để tiện kill/restart
  const swayTweens = useRef([]);

  if (!isAuthenticated || user?.role !== 'S') return null;
  if (isLoading) return <CircularProgress size={20} color="inherit" />;

  const { streak_count, is_streak_lit_today } = streakData;
  const currentLevel = getStreakLevel(streak_count);
  const config = levelConfigs[currentLevel];

  // Nếu chưa học hôm nay, làm xám và tắt animation
  const isActive = is_streak_lit_today;

  // HÀM TẠO TIA LỬA (SPARK)
  const createSpark = useCallback(
    (isBurst = false) => {
      if (!sparkContainerRef.current || !isActive) return;

      const spark = document.createElement('div');
      sparkContainerRef.current.appendChild(spark);

      const sizePx = isBurst ? Math.random() * 4 + 2 : Math.random() * 3 + 1;

      // Áp dụng style tĩnh inline
      Object.assign(spark.style, {
        position: 'absolute',
        bottom: '10%',
        left: '50%',
        width: `${sizePx}px`,
        height: `${sizePx}px`,
        backgroundColor: config.sparkColor,
        borderRadius: '50%',
        pointerEvents: 'none',
        mixBlendMode: 'screen',
        boxShadow: `0 0 ${sizePx * 2}px ${config.sparkColor}, 0 0 ${sizePx * 4}px ${config.sparkColor}`,
        zIndex: 10,
      });

      const startX = (Math.random() - 0.5) * (size * 0.8);
      const startY = (Math.random() - 0.5) * (size * 0.2);

      gsap.set(spark, { x: startX, y: startY, opacity: 1, scale: 1 });

      const flyHeight = isBurst
        ? -(Math.random() * size * 2 + size)
        : -(Math.random() * size + size * 0.5);
      const driftX = startX + (Math.random() - 0.5) * (size * 1.5);

      gsap.to(spark, {
        y: flyHeight,
        x: driftX,
        opacity: 0,
        scale: 0,
        duration: Math.random() * 0.8 + (isBurst ? 0.3 : 0.6),
        ease: isBurst ? 'circ.out' : 'power1.out',
        onComplete: () => {
          if (sparkContainerRef.current?.contains(spark)) {
            spark.remove();
          }
        },
      });
    },
    [config.sparkColor, isActive, size],
  );

  // HÀM LẮC LƯ HỮU CƠ (SWAY)
  const startSway = useCallback(() => {
    if (!isActive || !outerLayerRef.current || !innerLayerRef.current) return;

    // Kill các tween cũ nếu có
    swayTweens.current.forEach((t) => t.kill());
    swayTweens.current = [];

    const baseDuration = 1.1 + Math.random() * 0.4;
    const startDir = currentLevel % 2 === 0 ? 1 : -1;

    // Lớp ngoài
    swayTweens.current.push(
      gsap.to(outerLayerRef.current, {
        rotation: 4 * startDir,
        duration: baseDuration,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
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
        rotation: 2.5 * (startDir * -1),
        duration: baseDuration * 0.9,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
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
  }, [isActive, currentLevel]);

  // EFFECT KHỞI TẠO GSAP
  useEffect(() => {
    if (!isActive) return;

    // Thiết lập tâm xoay cho SVG
    gsap.set([outerLayerRef.current, innerLayerRef.current], { transformOrigin: 'bottom center' });

    startSway();

    // Vòng lặp bắn tia lửa âm ỉ
    const interval = setInterval(() => {
      if (Math.random() > 0.4) createSpark(false);
    }, 200);

    // Cleanup function: Xóa interval và kill tweens khi component unmount
    return () => {
      clearInterval(interval);
      swayTweens.current.forEach((t) => t.kill());
    };
  }, [isActive, startSway, createSpark]);

  // SỰ KIỆN HOVER: BÙNG CHÁY
  const handleMouseEnter = () => {
    if (!isActive) return;

    // Tạm dừng lắc lư
    swayTweens.current.forEach((t) => t.kill());
    gsap.killTweensOf([outerLayerRef.current, innerLayerRef.current]);

    // Bắn một loạt tia lửa
    const burstCount = Math.floor(Math.random() * 10) + 15;
    for (let i = 0; i < burstCount; i++) {
      setTimeout(() => createSpark(true), Math.random() * 200);
    }

    // Hoạt ảnh bùng lên lớp ngoài
    gsap.fromTo(
      outerLayerRef.current,
      { scaleY: 0.5, scaleX: 0.8, rotation: 0 },
      { scaleY: 1, scaleX: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)' },
    );

    // Hoạt ảnh bùng lên lớp trong
    gsap.fromTo(
      innerLayerRef.current,
      { scaleY: 0.4, scaleX: 0.7, rotation: 0 },
      {
        scaleY: 1,
        scaleX: 1,
        duration: 0.8,
        ease: 'elastic.out(1, 0.5)',
        delay: 0.05,
        onComplete: startSway,
      },
    );
  };

  return (
    <>
      <StreakSvgDefs />

      <Tooltip
        title={
          isActive ? `Level ${currentLevel} - Đã học hôm nay!` : 'Làm bài tập để giữ chuỗi nhé!'
        }
      >
        <Box
          ref={containerRef}
          onMouseEnter={handleMouseEnter}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            padding: '8px 16px 8px 10px',
            borderRadius: '30px',
            background: isActive
              ? 'linear-gradient(145deg, rgba(42,42,42,0.6), rgba(31,31,31,0.6))'
              : 'transparent',
            boxShadow: isActive ? '0 10px 20px rgba(0, 0, 0, 0.2)' : 'none',
            border: isActive ? '1px solid rgba(255,255,255,0.05)' : 'none',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: isActive ? 'translateY(-2px)' : 'none',
            },
          }}
        >
          {/* Vùng chứa ngọn lửa và tia lửa */}
          <Box
            sx={{
              position: 'relative',
              width: size,
              height: size,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              filter: isActive ? config.shadow : 'grayscale(100%) opacity(50%)',
              transition: 'filter 0.3s ease',
            }}
          >
            {/* Lớp Outer */}
            <Box
              component="svg"
              ref={outerLayerRef}
              sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            >
              <use href={`#f${currentLevel}-out`} />
            </Box>

            {/* Lớp Inner */}
            <Box
              component="svg"
              ref={innerLayerRef}
              sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            >
              <use href={`#f${currentLevel}-in`} />
            </Box>

            {/* DOM ảo để GSAP render tia lửa không bị React ghi đè */}
            <Box
              ref={sparkContainerRef}
              sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            />
          </Box>

          {/* Text */}
          {showText && (
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: `${size * 0.4}px`, // Chữ tự scale theo size truyền vào
                background: isActive
                  ? `linear-gradient(to right, ${config.sparkColor}, #ff4d00)`
                  : '#9e9e9e',
                WebkitBackgroundClip: isActive ? 'text' : 'none',
                WebkitTextFillColor: isActive ? 'transparent' : '#9e9e9e',
              }}
            >
              {streak_count}
            </Typography>
          )}
        </Box>
      </Tooltip>
    </>
  );
}

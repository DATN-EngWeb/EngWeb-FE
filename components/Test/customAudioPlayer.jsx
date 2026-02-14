'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Slider, Typography, Stack } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

const CustomAudioPlayer = ({
  src,
  isActive,
  isCurrentPlaying = null,
  onPlay = () => {},
  onPause = () => {},
}) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
      onPause();
    } else {
      audioRef.current.play();
      onPlay();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSliderChange = (e, newValue) => {
    setIsDragging(true);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setDragValue(newValue);
  };

  const handleSliderChangeCommitted = (e, newValue) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newValue;
      audioRef.current.play();
      onPlay();
      setIsPlaying(true);
    }
    setCurrentTime(newValue);
    setIsDragging(false);
  };

  const handleVolumeChange = (e, newValue) => {
    setVolume(newValue);
    if (audioRef.current) {
      audioRef.current.volume = newValue;
    }
  };

  useEffect(() => {
    if (!isActive && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  useEffect(() => {
    if (!isCurrentPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isCurrentPlaying]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: '#fff',
        borderRadius: '0.5rem',
        p: '8px 16px',
        border: '2px solid',
        borderColor: 'orange.light',
        width: '100%',
        boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
      }}
    >
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      <IconButton
        onClick={togglePlay}
        sx={{
          bgcolor: '#FFB800',
          color: '#fff',
          '&:hover': { bgcolor: '#E5A600' },
          width: 45,
          height: 45,
        }}
      >
        {isPlaying ? (
          <PauseIcon sx={{ fontSize: '1.6rem' }} />
        ) : (
          <PlayArrowRoundedIcon sx={{ fontSize: '2.2rem' }} />
        )}
      </IconButton>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1, ml: 2 }}>
        <Box
          onMouseEnter={() => setShowVolume(true)}
          onMouseLeave={() => setShowVolume(false)}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <IconButton sx={{ p: 0.5 }}>
            <VolumeUpIcon sx={{ color: '#555', fontSize: 24 }} />
          </IconButton>
          <Box
            sx={{
              width: showVolume ? '80px' : 0,
              transition: 'width 0.3s ease',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {showVolume && (
              <Slider
                size="small"
                value={volume}
                min={0}
                max={1}
                step={0.1}
                onChange={handleVolumeChange}
                sx={{
                  color: '#555',
                  mx: 1,
                  width: '70px',
                  '& .MuiSlider-thumb': {
                    width: 10,
                    height: 10,
                    bgcolor: '#555',
                    '&:hover, &.Mui-active, &.Mui-focusVisible': {
                      // Duy có thể chỉnh 4px hoặc 6px tùy độ to nhỏ của viền mờ
                      boxShadow: '0 0 0 6px rgba(85, 85, 85, 0.16)',
                    },
                  },
                }}
              />
            )}
          </Box>
        </Box>
        <Slider
          size="small"
          value={isDragging ? dragValue : currentTime}
          max={duration || 100}
          onChange={handleSliderChange}
          onChangeCommitted={handleSliderChangeCommitted}
          sx={{
            flex: 1,
            color: 'yellow.main',
            height: 8,
            '& .MuiSlider-track': { border: 'none' },
            '& .MuiSlider-rail': { bgcolor: '#E0E0E0', opacity: 1 },
            '& .MuiSlider-thumb': {
              width: '16px',
              height: '16px',
            },
          }}
        />
        <Typography
          sx={{
            color: 'text.gray',
            fontSize: '14px',
            fontWeight: 500,
            minWidth: '80px',
            textAlign: 'right',
          }}
        >
          {formatTime(currentTime)} / {formatTime(duration)}
        </Typography>
      </Stack>
    </Box>
  );
};

export default CustomAudioPlayer;

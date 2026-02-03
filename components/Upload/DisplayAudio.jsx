import React, { useState, useRef } from 'react';
import { Box, IconButton, Slider, Typography, Stack } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import * as s from '../../styles/Teacher/upload-test/DisplayAudioStyles';

const DisplayAudio = ({ src }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  React.useEffect(() => {
    if (audioRef.current && src) {
      audioRef.current.load();
    }
  }, [src]);

  if (!src) return null;

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlay = () => {
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <Box sx={s.playerContainer}>
      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={() => setDuration(audioRef.current.duration)}
        onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
        onEnded={() => setIsPlaying(false)}
      />

      <IconButton onClick={togglePlay} sx={s.playButton}>
        {isPlaying ? <PauseIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
      </IconButton>

      <VolumeUpIcon sx={{ color: '#555' }} />

      <Stack spacing={2} direction="row" sx={{ flex: 1, alignItems: 'center' }}>
        <Slider
          value={currentTime}
          max={duration}
          onChange={(_, val) => {
            audioRef.current.currentTime = val;
            setCurrentTime(val);
          }}
          sx={s.audioSlider}
        />

        <Typography variant="body1" sx={s.timeText}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Typography>
      </Stack>
    </Box>
  );
};

export default DisplayAudio;

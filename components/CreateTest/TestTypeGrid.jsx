'use client';

import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import MicIcon from '@mui/icons-material/Mic';
import EditIcon from '@mui/icons-material/Edit';

export default function TestTypeGrid() {
  const router = useRouter();

  const testTypes = [
    {
      title: 'Reading',
      description: 'Reading comprehension test',
      icon: <MenuBookIcon sx={{ color: '#89C0FF' }} />,
      bgColor: '#E3F2FD',
      path: '/teacher/upload-test/reading',
    },
    {
      title: 'Listening',
      description: 'Audio-based listening tests',
      icon: <HeadphonesIcon sx={{ color: '#B46BF4' }} />,
      bgColor: '#F3E8FF',
      path: '/teacher/upload-test/listening',
    },
    {
      title: 'Speaking',
      description: 'Speaking and pronunciation tests',
      icon: <MicIcon sx={{ color: '#7DD3A8' }} />,
      bgColor: '#DCFCE7',
      path: '/teacher/upload-test/speaking',
    },
    {
      title: 'Writing',
      description: 'Essay and writing tests',
      icon: <EditIcon sx={{ color: '#FFD469' }} />,
      bgColor: '#FFF4E9',
      path: '/teacher/upload-test/writing',
    },
  ];

  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        borderRadius: 3,
        p: 4,
        maxWidth: 700,
        mx: 'auto',
      }}
    >
      <Typography textAlign="center" fontWeight={600} mb={3} variant="h6">
        Choose Test Type
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 2,
        }}
      >
        {testTypes.map((type) => (
          <Box
            key={type.title}
            onClick={() => router.push(type.path)}
            sx={{
              backgroundColor: type.bgColor,
              borderRadius: 3,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              transition: '0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
              },
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              {type.icon}
            </Box>
            <Typography fontWeight={600} color="primary.main">
              {type.title}
            </Typography>
            <Typography sx={{ fontSize: '12px' }} color="text.secondary">
              {type.description}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

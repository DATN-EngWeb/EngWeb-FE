import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Image from 'next/image';
import WhatMakesUsDifferentImage from '../assets/different.png';
import { whatMakesUsDifferentStyles } from '../styles/WhatMakesUsDifferentStyles';

const features = [
  'Teacher & AI Feedback on Speaking and Writing',
  'Review Past Work and Track Progress',
  'Earn Points and Access Learning Dashboard',
  'Contribute and Download Study Materials',
];

export default function WhatMakesUsDifferent() {
  return (
    <Box sx={whatMakesUsDifferentStyles.mainContainer}>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={4}>
            <Typography variant="h2" sx={whatMakesUsDifferentStyles.heading}>
              What makes us different from other
            </Typography>
            <Typography variant="body1" sx={whatMakesUsDifferentStyles.description}>
              Our commitment is to help you improve your English efficiently with personalized
              tools, continuous progress tracking, and interactive learning experiences.
            </Typography>
            <List sx={whatMakesUsDifferentStyles.listContainer}>
              {features.map((feature, index) => (
                <ListItem key={index} sx={whatMakesUsDifferentStyles.listItem}>
                  <ListItemIcon sx={whatMakesUsDifferentStyles.listItemIcon}>
                    <CheckCircleIcon />
                  </ListItemIcon>
                  <ListItemText primary={feature} sx={whatMakesUsDifferentStyles.listItemText} />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'flex-end',
                width: '100%',
                height: '100%',
              }}
            >
              <Image
                src={WhatMakesUsDifferentImage}
                alt="What makes us different"
                width={380}
                height={340}
                style={{ width: '95%', maxWidth: 420, height: 'auto' }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

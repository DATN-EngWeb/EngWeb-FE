import React from 'react';
import { Box, Container, Typography, Grid, Link } from '@mui/material';
import Image from 'next/image';
import LogoImage from '../assets/logo.png';
import { footerStyles } from '../styles/FooterStyles';

const homeLinks = ['Benefits', 'Our Courses', 'Our Testimonials', 'Our FAQ'];
const aboutLinks = ['Company', 'Achievements', 'Our Clients'];

export default function Footer() {
  return (
    <Box sx={footerStyles.mainContainer}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Link href="/" style={footerStyles.logoLink}>
              <Image src={LogoImage} alt="NENS" width={32} height={24} />
            </Link>

            <Box sx={footerStyles.contactInfo}>
              <Typography variant="body2">hello.hello@gmail.com</Typography>
              <Typography variant="body2">+48 8880 23 3308</Typography>
              <Typography variant="body2">Somewhere in the World</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4}>
                <Typography variant="h6" sx={footerStyles.sectionTitle}>
                  Home
                </Typography>
                <Box sx={footerStyles.linksContainer}>
                  {homeLinks.map((link) => (
                    <Link key={link} href="#" sx={footerStyles.footerLink}>
                      {link}
                    </Link>
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="h6" sx={footerStyles.sectionTitle}>
                  About Us
                </Typography>
                <Box sx={footerStyles.linksContainer}>
                  {aboutLinks.map((link) => (
                    <Link key={link} href="#" sx={footerStyles.footerLink}>
                      {link}
                    </Link>
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="h6" sx={footerStyles.sectionTitle}>
                  Social Profiles
                </Typography>
                <Box sx={footerStyles.socialLinksContainer}>
                  <Link href="#" sx={footerStyles.socialLink}>
                    <Image src={LogoImage} alt="NENS" width={32} height={24} />
                  </Link>
                  <Link href="#" sx={footerStyles.socialLink}>
                    🐦
                  </Link>
                  <Link href="#" sx={footerStyles.socialLink}>
                    📷
                  </Link>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import Image from 'next/image';
import FacebookImage from '../../assets/img/facebook.png';
import LinkedinImage from '../../assets/img/linkedin.png';
import TwitterImage from '../../assets/img/twitter.png';
import LogoImage from '../../assets/img/logo.png';
import { footerStyles } from '../../styles/Home/FooterStyles';

const homeLinks = ['Benefits', 'Our Courses', 'Our Testimonials', 'Our FAQ'];
const aboutLinks = ['Company', 'Achievements', 'Our Clients'];

export default function Footer() {
  return (
    <Box
      sx={{
        ...footerStyles.mainContainer,
        '@media print': {
          display: 'none',
        },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={footerStyles.columnsWrapper}>
          <Box sx={footerStyles.columnWide}>
            <Link href="/" style={footerStyles.logoLink}>
              <Image src={LogoImage} alt="NENS" width={32} height={24} />
            </Link>
            <Box sx={footerStyles.contactInfo}>
              <Typography variant="body2">nens.hcmsus@gmail.com</Typography>
              <Typography variant="body2">+91 98183 23 2309</Typography>
              <Typography variant="body2">Somewhere in the World</Typography>
            </Box>
          </Box>

          <Box sx={footerStyles.columnNarrow}>
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
          </Box>

          <Box sx={footerStyles.columnNarrow}>
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
          </Box>

          <Box sx={footerStyles.columnNarrow}>
            <Typography variant="h6" sx={footerStyles.sectionTitle}>
              Social Profiles
            </Typography>
            <Box sx={footerStyles.socialLinksContainer}>
              <Link href="#" sx={footerStyles.socialLink}>
                <Image src={FacebookImage} alt="Facebook" width={40} height={40} />
              </Link>
              <Link href="#" sx={footerStyles.socialLink}>
                <Image src={TwitterImage} alt="Twitter" width={40} height={40} />
              </Link>
              <Link href="#" sx={footerStyles.socialLink}>
                <Image src={LinkedinImage} alt="LinkedIn" width={40} height={40} />
              </Link>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

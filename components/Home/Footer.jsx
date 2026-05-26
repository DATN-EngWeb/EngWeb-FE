import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
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
    <Box sx={footerStyles.mainContainer}>
      <Container maxWidth="lg">
        <Box sx={footerStyles.columnsWrapper}>
          <Box sx={footerStyles.columnWide}>
            <Link href="/" style={footerStyles.logoLink}>
              <Image src={LogoImage} alt="NENS" width={32} height={24} />
            </Link>
            <Box sx={footerStyles.contactInfo}>
              <Link
                href="mailto:nens.hcmsus@gmail.com"
                underline="none"
                color="inherit"
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <EmailOutlinedIcon fontSize="small" />
                <Typography variant="body2">nens.hcmsus@gmail.com</Typography>
              </Link>
              <Link
                href="tel:+9198183232309"
                underline="none"
                color="inherit"
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <PhoneOutlinedIcon fontSize="small" />
                <Typography variant="body2">+91 98183 23 2309</Typography>
              </Link>
              <Typography variant="body2">Somewhere in the World</Typography>
            </Box>
          </Box>

          <Box sx={footerStyles.columnNarrow}>
            <Typography variant="h6" sx={footerStyles.sectionTitle}>
              Home
            </Typography>
            <Box sx={footerStyles.linksContainer}>
              {homeLinks.map((link) => (
                <Typography key={link} variant="body2" sx={footerStyles.footerLink}>
                  {link}
                </Typography>
              ))}
            </Box>
          </Box>

          <Box sx={footerStyles.columnNarrow}>
            <Typography variant="h6" sx={footerStyles.sectionTitle}>
              About Us
            </Typography>
            <Box sx={footerStyles.linksContainer}>
              {aboutLinks.map((link) => (
                <Typography key={link} variant="body2" sx={footerStyles.footerLink}>
                  {link}
                </Typography>
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

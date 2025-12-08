'use client';

import React from 'react';
import { Dialog, DialogContent, Box, Typography, Button, Card, CardContent } from '@mui/material';
import Image from 'next/image';
import StudentIcon from '../../assets/img/student.png';
import TeacherIcon from '../../assets/img/teacher.png';
import { roleModalStyles } from '../../styles/Login/RoleModalStyles';

export default function RoleSelectionModal({ open, onClose, onSelectRole, actionType }) {
  const handleRoleSelect = (role) => {
    onSelectRole(role);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: roleModalStyles.dialogPaper,
      }}
    >
      <DialogContent sx={roleModalStyles.dialogContent}>
        <Typography sx={roleModalStyles.title}>Welcome to EngApp</Typography>

        <Box sx={roleModalStyles.cardsContainer}>
          {/* Student Card */}
          <Card
            sx={roleModalStyles.card}
            onClick={() => handleRoleSelect('student')}
            role="button"
            tabIndex={0}
          >
            <CardContent sx={roleModalStyles.cardContent}>
              <Box sx={roleModalStyles.iconContainer}>
                <Image
                  src={StudentIcon}
                  alt="Student"
                  width={800}
                  height={800}
                  style={roleModalStyles.icon}
                />
              </Box>
              <Box component="span" sx={roleModalStyles.roleButton}>
                I am a student
              </Box>
            </CardContent>
          </Card>

          {/* Teacher Card */}
          <Card
            sx={roleModalStyles.card}
            onClick={() => handleRoleSelect('teacher')}
            role="button"
            tabIndex={0}
          >
            <CardContent sx={roleModalStyles.cardContent}>
              <Box sx={roleModalStyles.iconContainer}>
                <Image
                  src={TeacherIcon}
                  alt="Teacher"
                  width={800}
                  height={800}
                  style={roleModalStyles.icon}
                />
              </Box>
              <Box component="span" sx={roleModalStyles.roleButton}>
                I am a teacher
              </Box>
            </CardContent>
          </Card>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

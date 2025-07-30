import React from 'react';
import { Box, Typography } from '@mui/material';

const Profile: React.FC = () => (
  <Box sx={{ p: 4 }}>
    <Typography variant="h4" gutterBottom>Profile</Typography>
    <Typography variant="body1">User profile information goes here.</Typography>
  </Box>
);

export default Profile; 
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  CircularProgress,
  Grid
} from '@mui/material';

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      const response = await fetch(`/api/students/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch student data');
      }
      const studentData = await response.json();
      setStudent(studentData);
    } catch (error) {
      console.error('Error fetching student:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !student) {
    return (
      <Box p={3}>
        <Typography variant="h4" color="error">
          {error || 'Student not found'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Card>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Avatar
              src={student.picture}
              sx={{ width: 120, height: 120, mb: 2 }}
            />
            <Typography variant="h4">
              {student.first_name} {student.last_name}
            </Typography>
            <Chip
              label={student.status}
              color={student.status === 'active' ? 'success' : 'default'}
              sx={{ mt: 1 }}
            />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Personal Information</Typography>
              <Typography><strong>Email:</strong> {student.email || 'N/A'}</Typography>
              <Typography><strong>Phone:</strong> {student.phone || 'N/A'}</Typography>
              <Typography><strong>Date of Birth:</strong> {student.date_of_birth || 'N/A'}</Typography>
              <Typography><strong>Birth Country:</strong> {student.birth_country || 'N/A'}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Identification Numbers</Typography>
              <Typography><strong>NIP:</strong> {student.nip || 'N/A'}</Typography>
              <Typography><strong>CNSS Number:</strong> {student.cnss_number || 'N/A'}</Typography>
              <Typography><strong>CNAMGS Number:</strong> {student.cnamgs_number || 'N/A'}</Typography>
              <Typography><strong>NFC UID:</strong> {student.nfc_uid || 'Not set'}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6">Address</Typography>
              <Typography>{student.address || 'No address provided'}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentProfile;
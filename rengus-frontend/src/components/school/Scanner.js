import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import {
  Person as PersonIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { Scanner as QrScanner } from '@yudiel/react-qr-scanner'; // Renamed import
import { useAuth } from '../../contexts/AuthContext';

const Scanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { currentUser } = useAuth();

  const handleScan = (result) => {
    if (result) {
      setScanResult(result);
      setScanning(false);
      verifyStudent(result);
    }
  };

  const handleError = (err) => {
    console.error('QR Scanner error:', err);
    setError('Scanner error: ' + err.message);
  };

  const verifyStudent = async (qrData) => {
    try {
      // Parse the QR data (assuming it's a JSON string)
      const studentInfo = JSON.parse(qrData);
      
      // Verify with your backend
      const response = await fetch(`/api/students/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: studentInfo.id,
          schoolId: currentUser.school_id
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setStudentData(data);
        setDialogOpen(true);
      } else {
        setError('Student verification failed');
      }
    } catch (err) {
      console.error('Error verifying student:', err);
      setError('Invalid QR code format');
    }
  };

  const resetScanner = () => {
    setScanning(false);
    setScanResult(null);
    setStudentData(null);
    setError(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetScanner();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Student Scanner
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          {scanning ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Scan Student QR Code
              </Typography>
              <QrScanner // Use the renamed import
                onScan={handleScan}
                onError={handleError}
                constraints={{ video: { facingMode: 'environment' } }}
                style={{ width: '100%', maxWidth: '500px' }}
              />
              <Button 
                variant="outlined" 
                onClick={resetScanner}
                sx={{ mt: 2 }}
              >
                Cancel Scanning
              </Button>
            </Box>
          ) : (
            <Box textAlign="center">
              <Typography variant="body1" gutterBottom>
                {scanResult ? 'Scan completed' : 'Ready to scan student QR codes'}
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => setScanning(true)}
                size="large"
              >
                Start Scanning
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Student Verification Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Student Verification
        </DialogTitle>
        <DialogContent>
          {studentData && (
            <Box>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ width: 64, height: 64, mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {studentData.firstName} {studentData.lastName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Student ID: {studentData.id}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body1" gutterBottom>
                Status: {studentData.verified ? 'Verified' : 'Not Verified'}
              </Typography>
              
              {studentData.courses && studentData.courses.length > 0 && (
                <Box mt={2}>
                  <Typography variant="h6" gutterBottom>
                    Courses
                  </Typography>
                  <List>
                    {studentData.courses.map((course, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={course.name}
                          secondary={`Progress: ${course.progress}%`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Scanner;
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Grid,
  LinearProgress,
  Avatar,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CompleteIcon,
  Schedule as PendingIcon,
  Person as StudentIcon,
  Edit as EditIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const StudentDossierProgress = ({ studentId }) => {
  const [dossier, setDossier] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [updateData, setUpdateData] = useState({});
  const { currentUser } = useAuth();

  useEffect(() => {
    if (studentId) {
      fetchDossierProgress();
    }
  }, [studentId]);

  const fetchDossierProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/students/${studentId}/dossier-progress`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dossier data');
      }
      
      const data = await response.json();
      setDossier(data);
      
      // Find the first incomplete step
      const firstIncomplete = data.steps.findIndex(step => !step.completed);
      setActiveStep(firstIncomplete !== -1 ? firstIncomplete : data.steps.length - 1);
    } catch (error) {
      console.error('Error fetching dossier progress:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStep = (step) => {
    setCurrentStep(step);
    setUpdateData({
      completed: step.completed,
      completionDate: step.completionDate || new Date().toISOString().split('T')[0],
      result: step.result || ''
    });
    setEditDialogOpen(true);
  };

  const handleUpdateStep = async () => {
    try {
      const response = await fetch(`/api/dossier-steps/${currentStep.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update step');
      }
      
      setEditDialogOpen(false);
      fetchDossierProgress(); // Refresh data
    } catch (error) {
      console.error('Error updating step:', error);
      setError(error.message);
    }
  };

  const handleMarkComplete = async (step) => {
    try {
      const response = await fetch(`/api/dossier-steps/${step.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          completed: true,
          completionDate: new Date().toISOString().split('T')[0],
          result: step.result || 'Completed'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark step as complete');
      }
      
      fetchDossierProgress(); // Refresh data
    } catch (error) {
      console.error('Error marking step as complete:', error);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchDossierProgress}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Paper>
    );
  }

  if (!dossier) return <Typography>No dossier data available.</Typography>;

  const completedSteps = dossier.steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / dossier.steps.length) * 100;

  return (
    <>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box display="flex" alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <StudentIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">{dossier.studentName}</Typography>
              <Typography variant="body2" color="textSecondary">
                License Type: {dossier.licenseType}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Student ID: {studentId}
              </Typography>
            </Box>
          </Box>
          <Chip 
            label={dossier.status} 
            color={
              dossier.status === 'completed' ? 'success' : 
              dossier.status === 'in_progress' ? 'primary' : 'default'
            } 
          />
        </Box>

        {/* Progress Bar */}
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">Overall Progress</Typography>
            <Typography variant="body2">{Math.round(progressPercentage)}%</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progressPercentage} 
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>

        {/* Progress Stepper */}
        <Stepper activeStep={activeStep} orientation="vertical">
          {dossier.steps.map((step, index) => (
            <Step key={step.id} completed={step.completed}>
              <StepLabel
                icon={
                  step.completed ? (
                    <CompleteIcon color="success" />
                  ) : (
                    <PendingIcon color={index === activeStep ? 'primary' : 'disabled'} />
                  )
                }
              >
                <Box display="flex" alignItems="center">
                  <Typography>{step.stepName}</Typography>
                  {step.completed ? (
                    <Chip
                      label="Completed"
                      size="small"
                      color="success"
                      sx={{ ml: 2 }}
                    />
                  ) : (
                    <Chip
                      label="Pending"
                      size="small"
                      sx={{ ml: 2 }}
                    />
                  )}
                  {currentUser.role === 'school' && (
                    <Tooltip title="Edit step">
                      <IconButton 
                        size="small" 
                        sx={{ ml: 1 }}
                        onClick={() => handleEditStep(step)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </StepLabel>
              <StepContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      Status: {step.completed ? 'Completed' : 'Pending'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {step.completed && `Completed on: ${new Date(step.completionDate).toLocaleDateString()}`}
                    </Typography>
                  </Grid>
                  {step.result && (
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        Result: <Chip label={step.result} size="small" />
                      </Typography>
                    </Grid>
                  )}
                  {!step.completed && currentUser.role === 'school' && (
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleMarkComplete(step)}
                      >
                        Mark as Complete
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Edit Step Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Step: {currentStep?.stepName}
          <IconButton
            aria-label="close"
            onClick={() => setEditDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              label="Status"
              select
              fullWidth
              value={updateData.completed}
              onChange={(e) => setUpdateData({...updateData, completed: e.target.value})}
              sx={{ mb: 2 }}
            >
              <MenuItem value={true}>Completed</MenuItem>
              <MenuItem value={false}>Pending</MenuItem>
            </TextField>
            
            {updateData.completed && (
              <>
                <TextField
                  label="Completion Date"
                  type="date"
                  fullWidth
                  value={updateData.completionDate}
                  onChange={(e) => setUpdateData({...updateData, completionDate: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  label="Result"
                  select
                  fullWidth
                  value={updateData.result}
                  onChange={(e) => setUpdateData({...updateData, result: e.target.value})}
                >
                  <MenuItem value="Passed">Passed</MenuItem>
                  <MenuItem value="Failed">Failed</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </TextField>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateStep} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StudentDossierProgress;
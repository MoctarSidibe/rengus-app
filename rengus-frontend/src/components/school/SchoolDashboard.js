import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Chip
} from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  Assignment as DossierIcon,
  TrendingUp as ProgressIcon,
  CheckCircle as CompleteIcon,
  Schedule as PendingIcon
} from '@mui/icons-material';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useAuth } from '../../contexts/AuthContext';
import { studentsAPI, dossiersAPI } from '../../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const SchoolDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalDossiers: 0,
    completedDossiers: 0,
    inProgressDossiers: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch students and dossiers for the school
        const [studentsResponse, dossiersResponse] = await Promise.all([
          studentsAPI.getBySchool(currentUser.school_id),
          dossiersAPI.getBySchool(currentUser.school_id)
        ]);

        const students = studentsResponse.data;
        const dossiers = dossiersResponse.data;

        // Calculate statistics
        const completedDossiers = dossiers.filter(d => d.status === 'completed').length;
        const inProgressDossiers = dossiers.filter(d => d.status === 'in_progress').length;

        setStats({
          totalStudents: students.length,
          totalDossiers: dossiers.length,
          completedDossiers,
          inProgressDossiers
        });

        // Prepare recent activity data (last 5 updated dossiers)
        const activityData = dossiers
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 5)
          .map(dossier => ({
            studentName: `${dossier.student.first_name} ${dossier.student.last_name}`,
            stepName: `Step ${dossier.current_step}`,
            status: dossier.status === 'completed' ? 'Completed' : 'In Progress',
            date: dossier.updatedAt
          }));

        setRecentActivity(activityData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [currentUser.school_id]);

  const progressData = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [
      {
        data: [stats.completedDossiers, stats.inProgressDossiers, stats.totalDossiers - stats.completedDossiers - stats.inProgressDossiers],
        backgroundColor: ['#4caf50', '#2196f3', '#f44336'],
        hoverBackgroundColor: ['#388e3c', '#1976d2', '#d32f2f'],
      },
    ],
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        School Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#2196f3', mr: 2 }}>
                  <SchoolIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{currentUser.school_name}</Typography>
                  <Typography variant="body2" color="textSecondary">Your School</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#ff9800', mr: 2 }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.totalStudents}</Typography>
                  <Typography variant="body2" color="textSecondary">Total Students</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#4caf50', mr: 2 }}>
                  <DossierIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.totalDossiers}</Typography>
                  <Typography variant="body2" color="textSecondary">Total Dossiers</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#9c27b0', mr: 2 }}>
                  <ProgressIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.completedDossiers}</Typography>
                  <Typography variant="body2" color="textSecondary">Completed Dossiers</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Progress Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Dossier Progress Distribution</Typography>
            <Box height={300}>
              <Doughnut 
                data={progressData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }} 
              />
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Recent Activity</Typography>
            <List>
              {recentActivity.map((activity, index) => (
                <Box key={index}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        {activity.status === 'Completed' ? <CompleteIcon /> : <PendingIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.studentName}
                      secondary={
                        <Box>
                          <Typography variant="body2">{activity.stepName}</Typography>
                          <Box display="flex" alignItems="center" mt={1}>
                            <Chip 
                              size="small" 
                              label={activity.status} 
                              color={activity.status === 'Completed' ? 'success' : 'primary'} 
                            />
                            <Typography variant="caption" sx={{ ml: 1 }}>
                              {new Date(activity.date).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recentActivity.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SchoolDashboard;
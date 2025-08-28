import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { usersAPI, schoolsAPI, studentsAPI, examCentersAPI, dossiersAPI } from '../../services/api';

const AdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [stats, setStats] = useState({
    users: 0,
    schools: 0,
    students: 0,
    examCenters: 0,
    activeDossiers: 0,
    completedDossiers: 0
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    studentProgress: null,
    licenseDistribution: null,
    statusDistribution: null
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [usersRes, schoolsRes, studentsRes, examCentersRes, dossiersRes] = await Promise.all([
        usersAPI.getAll(),
        schoolsAPI.getAll(),
        studentsAPI.getAll(),
        examCentersAPI.getAll(),
        dossiersAPI.getAll()
      ]);

      const users = usersRes.data;
      const schools = schoolsRes.data;
      const students = studentsRes.data;
      const examCenters = examCentersRes.data;
      const dossiers = dossiersRes.data;

      setStats({
        users: users.length,
        schools: schools.length,
        students: students.length,
        examCenters: examCenters.length,
        activeDossiers: dossiers.filter(d => d.progress < 100).length,
        completedDossiers: dossiers.filter(d => d.progress === 100).length
      });

      // Generate recent activities
      const activities = [
        {
          id: 1,
          action: 'New user registration',
          target: 'admin_user',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: 2,
          action: 'School added',
          target: 'Auto Ecole Libreville',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: 3,
          action: 'Exam center updated',
          target: 'Centre Examen Port-Gentil',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          status: 'pending'
        },
        {
          id: 4,
          action: 'Student registration',
          target: 'Jean Mbega',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: 5,
          action: 'Theory exam passed',
          target: 'Marie Ndong',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        }
      ];

      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ 
      height: '100%', 
      background: `linear-gradient(45deg, ${color} 0%, ${color}dd 100%)`, 
      color: 'white',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[4]
      }
    }}>
      <CardContent sx={{ p: isMobile ? 1 : 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant={isMobile ? "h5" : "h4"} component="div" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant={isMobile ? "body2" : "body1"} sx={{ opacity: 0.9 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ opacity: 0.8, fontSize: isMobile ? 30 : 40 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon fontSize="small" />;
      case 'pending': return <ScheduleIcon fontSize="small" />;
      case 'failed': return <CancelIcon fontSize="small" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
          Admin Dashboard
        </Typography>
        <IconButton onClick={fetchData} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Users"
            value={stats.users}
            icon={<PeopleIcon />}
            color="#3f51b5"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Schools"
            value={stats.schools}
            icon={<SchoolIcon />}
            color="#f50057"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Students"
            value={stats.students}
            icon={<PeopleIcon />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Exam Centers"
            value={stats.examCenters}
            icon={<AssignmentIcon />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Active"
            value={stats.activeDossiers}
            subtitle="Dossiers"
            icon={<TrendingUpIcon />}
            color="#9c27b0"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Completed"
            value={stats.completedDossiers}
            subtitle="Dossiers"
            icon={<CheckCircleIcon />}
            color="#2e7d32"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              <TableContainer sx={{ maxHeight: isMobile ? 300 : 400 }}>
                <Table size={isMobile ? "small" : "medium"} stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Action</TableCell>
                      {!isMobile && <TableCell>Target</TableCell>}
                      <TableCell>Time</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentActivities.map((activity) => (
                      <TableRow key={activity.id} hover>
                        <TableCell>{activity.action}</TableCell>
                        {!isMobile && <TableCell>{activity.target}</TableCell>}
                        <TableCell>
                          {new Date(activity.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            icon={getStatusIcon(activity.status)}
                            label={activity.status} 
                            color={getStatusColor(activity.status)} 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Chip 
                  icon={<PeopleIcon />} 
                  label="Manage Users" 
                  clickable 
                  onClick={() => window.location.href = '/admin/users'}
                  variant="outlined"
                  sx={{ justifyContent: 'flex-start', p: 2 }}
                />
                <Chip 
                  icon={<SchoolIcon />} 
                  label="Manage Schools" 
                  clickable 
                  onClick={() => window.location.href = '/admin/schools'}
                  variant="outlined"
                  sx={{ justifyContent: 'flex-start', p: 2 }}
                />
                <Chip 
                  icon={<AssignmentIcon />} 
                  label="Manage Exam Centers" 
                  clickable 
                  onClick={() => window.location.href = '/admin/exam-centers'}
                  variant="outlined"
                  sx={{ justifyContent: 'flex-start', p: 2 }}
                />
                <Chip 
                  icon={<TrendingUpIcon />} 
                  label="View Reports" 
                  clickable 
                  onClick={() => window.location.href = '/admin/reports'}
                  variant="outlined"
                  sx={{ justifyContent: 'flex-start', p: 2 }}
                />
                <Chip 
                  icon={<CheckCircleIcon />} 
                  label="Process Dossiers" 
                  clickable 
                  onClick={() => window.location.href = '/admin/dossiers'}
                  variant="outlined"
                  sx={{ justifyContent: 'flex-start', p: 2 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
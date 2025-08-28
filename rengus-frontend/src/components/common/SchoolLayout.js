import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as DocumentIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  School as SchoolIcon,
  QrCodeScanner as ScannerIcon,
  AccountCircle as AccountIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 280;

const SchoolLayout = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const { currentUser, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileOpen = (event) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchor(null);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/school/dashboard' },
    { text: 'Scanner', icon: <ScannerIcon />, path: '/school/scanner' },
    { text: 'Students', icon: <PeopleIcon />, path: '/school/students' },
    { text: 'My Dossiers', icon: <DocumentIcon />, path: '/school/my-dossiers' },
    { text: 'Exam Centers', icon: <SchoolIcon />, path: '/school/available-centers' },
    { text: 'Logout', icon: <LogoutIcon />, action: handleLogout },
  ];

  const drawer = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      background: 'linear-gradient(180deg, #1e3a8a 0%, #0f172a 100%)',
      color: 'white',
    }}>
      <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Avatar 
          sx={{ 
            width: 80, 
            height: 80, 
            margin: '0 auto 10px',
            border: '2px solid white',
            backgroundColor: '#2D4CC8',
            fontSize: '2rem',
            fontWeight: 'bold'
          }} 
        >
          {currentUser?.username?.split(' ').map(n => n[0]).join('').toUpperCase()}
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          RENGUS DIGITAL
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          School Panel
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
          Welcome, {currentUser?.username}
        </Typography>
        <Typography variant="caption" sx={{ 
          display: 'inline-block',
          mt: 0.5,
          p: 0.5,
          borderRadius: 1,
          backgroundColor: 'rgba(255,255,255,0.1)',
          opacity: 0.8 
        }}>
          {currentUser?.school_name || 'Auto École'}
        </Typography>
      </Box>
      
      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <ListItem 
            key={item.text}
            component={item.path ? Link : 'div'}
            to={item.path}
            onClick={item.action || (() => isMobile && setMobileOpen(false))}
            sx={{
              borderLeft: location.pathname === item.path ? '3px solid white' : '3px solid transparent',
              backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ style: { color: 'white' } }} 
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: theme.palette.primary.dark,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>
          <Tooltip title="Account settings">
            <IconButton onClick={handleProfileOpen} sx={{ ml: 2 }}>
              <AccountIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={handleProfileClose}
          >
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default SchoolLayout;
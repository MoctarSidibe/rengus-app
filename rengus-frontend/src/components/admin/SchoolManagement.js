import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { schoolsAPI } from '../../services/api';

const SchoolManagement = () => {
  const [schools, setSchools] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    director_name: ''
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const response = await schoolsAPI.getAll();
      setSchools(response.data);
    } catch (error) {
      showSnackbar('Error fetching schools', 'error');
      console.error('Error fetching schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSchool) {
        await schoolsAPI.update(editingSchool.id, formData);
        showSnackbar('School updated successfully', 'success');
      } else {
        await schoolsAPI.create(formData);
        showSnackbar('School created successfully', 'success');
      }
      
      setOpenDialog(false);
      setEditingSchool(null);
      setFormData({ name: '', address: '', phone: '', email: '', director_name: '' });
      fetchSchools();
    } catch (error) {
      const message = error.response?.data?.message || `Error ${editingSchool ? 'updating' : 'creating'} school`;
      showSnackbar(message, 'error');
      console.error('Error saving school:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this school?')) return;
    
    try {
      await schoolsAPI.delete(id);
      showSnackbar('School deleted successfully', 'success');
      fetchSchools();
    } catch (error) {
      const message = error.response?.data?.message || 'Error deleting school';
      showSnackbar(message, 'error');
      console.error('Error deleting school:', error);
    }
  };

  const handleEdit = (school) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      address: school.address,
      phone: school.phone,
      email: school.email,
      director_name: school.director_name
    });
    setOpenDialog(true);
  };

  const handleNewSchool = () => {
    setEditingSchool(null);
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      director_name: ''
    });
    setOpenDialog(true);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        School Management
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Manage Driving Schools
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleNewSchool}
          >
            Add New School
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <Typography>Loading schools...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Director</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell>{school.name}</TableCell>
                  <TableCell>{school.address}</TableCell>
                  <TableCell>{school.phone}</TableCell>
                  <TableCell>{school.email}</TableCell>
                  <TableCell>{school.director_name}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(school)} color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(school.id)} color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSchool ? 'Edit School' : 'Add New School'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="School Name"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Address"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Phone"
              fullWidth
              variant="outlined"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Director Name"
              fullWidth
              variant="outlined"
              value={formData.director_name}
              onChange={(e) => setFormData({ ...formData, director_name: e.target.value })}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingSchool ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SchoolManagement;
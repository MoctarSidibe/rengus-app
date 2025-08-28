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
  Alert,
  CircularProgress
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { examCentersAPI } from '../../services/api';

const ExamCenterManagement = () => {
  const [examCenters, setExamCenters] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCenter, setEditingCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact_person: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    fetchExamCenters();
  }, []);

  const fetchExamCenters = async () => {
    try {
      setLoading(true);
      const response = await examCentersAPI.getAll();
      setExamCenters(response.data);
    } catch (error) {
      showSnackbar('Error fetching exam centers', 'error');
      console.error('Error fetching exam centers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCenter) {
        await examCentersAPI.update(editingCenter.id, formData);
        showSnackbar('Exam center updated successfully', 'success');
      } else {
        await examCentersAPI.create(formData);
        showSnackbar('Exam center created successfully', 'success');
      }
      
      setOpenDialog(false);
      setEditingCenter(null);
      setFormData({ name: '', address: '', contact_person: '', phone: '', email: '' });
      fetchExamCenters();
    } catch (error) {
      const message = error.response?.data?.error || `Error ${editingCenter ? 'updating' : 'creating'} exam center`;
      showSnackbar(message, 'error');
      console.error('Error saving exam center:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam center?')) return;
    
    try {
      await examCentersAPI.delete(id);
      showSnackbar('Exam center deleted successfully', 'success');
      fetchExamCenters();
    } catch (error) {
      const message = error.response?.data?.error || 'Error deleting exam center';
      showSnackbar(message, 'error');
      console.error('Error deleting exam center:', error);
    }
  };

  const handleEdit = (center) => {
    setEditingCenter(center);
    setFormData({
      name: center.name,
      address: center.address,
      contact_person: center.contact_person,
      phone: center.phone,
      email: center.email
    });
    setOpenDialog(true);
  };

  const handleNewCenter = () => {
    setEditingCenter(null);
    setFormData({
      name: '',
      address: '',
      contact_person: '',
      phone: '',
      email: ''
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Exam Center Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleNewCenter}
        >
          Add New Exam Center
        </Button>
      </Box>

      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Contact Person</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {examCenters.map((center) => (
                    <TableRow key={center.id}>
                      <TableCell>{center.name}</TableCell>
                      <TableCell>{center.address}</TableCell>
                      <TableCell>{center.contact_person}</TableCell>
                      <TableCell>{center.phone}</TableCell>
                      <TableCell>{center.email}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(center)} color="primary">
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(center.id)} color="error">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCenter ? 'Edit Exam Center' : 'Add New Exam Center'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
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
              label="Contact Person"
              fullWidth
              variant="outlined"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
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
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingCenter ? 'Update' : 'Create'}
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

export default ExamCenterManagement;
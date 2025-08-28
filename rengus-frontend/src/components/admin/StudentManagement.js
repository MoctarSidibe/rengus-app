import React, { useState, useEffect, useRef } from 'react';
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
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  Avatar,
  Grid,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material';
import { Edit, Delete, Add, QrCode, Refresh, CloudUpload, Camera, CameraAlt } from '@mui/icons-material';
import { studentsAPI, schoolsAPI } from '../../services/api';
import { QRCodeSVG } from 'qrcode.react';
import Webcam from 'react-webcam';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [qrDialog, setQrDialog] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    birth_country: '',
    address: '',
    school_id: '',
    status: 'active',
    nip: '',
    cnss_number: '',
    cnamgs_number: '',
    picture: '',
    nfc_uid: '',
    qr_code: ''
  });
  const [pictureFile, setPictureFile] = useState(null);
  const [picturePreview, setPicturePreview] = useState('');
  const [pictureMode, setPictureMode] = useState('upload');
  const webcamRef = useRef(null);

  useEffect(() => {
    fetchStudents();
    fetchSchools();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.getAll();
      setStudents(response.data);
    } catch (error) {
      showAlert('Error fetching students', 'error');
    }
  };

  const fetchSchools = async () => {
    try {
      const response = await schoolsAPI.getAll();
      setSchools(response.data);
    } catch (error) {
      showAlert('Error fetching schools', 'error');
    }
  };

  const generateQRCode = (studentId) => {
    return `${window.location.origin}/student/${studentId}`;
  };

  const generateNFCUID = () => {
    const characters = 'ABCDEF0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handleGenerateNFC = () => {
    setFormData({ ...formData, nfc_uid: generateNFCUID() });
  };

  const handlePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicturePreview(reader.result);
        setFormData({ ...formData, picture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPicturePreview(imageSrc);
    setFormData({ ...formData, picture: imageSrc });
  };

  const handleOpenDialog = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({ 
        ...student,
        birth_country: student.birth_country || '',
        nip: student.nip || '',
        cnss_number: student.cnss_number || '',
        cnamgs_number: student.cnamgs_number || '',
        picture: student.picture || '',
        nfc_uid: student.nfc_uid || '',
        qr_code: student.qr_code || generateQRCode(student.id)
      });
      setPicturePreview(student.picture || '');
    } else {
      setEditingStudent(null);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        birth_country: '',
        address: '',
        school_id: '',
        status: 'active',
        nip: '',
        cnss_number: '',
        cnamgs_number: '',
        picture: '',
        nfc_uid: '',
        qr_code: ''
      });
      setPicturePreview('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setPictureFile(null);
    setPicturePreview('');
    setPictureMode('upload');
  };

  const handleShowQR = (student) => {
    setCurrentStudent(student);
    setQrDialog(true);
  };

  const handleCloseQR = () => {
    setQrDialog(false);
  };

  // In the handleSubmit function, replace the QR code update logic:
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // Generate QR code if it doesn't exist
    const qrCodeData = formData.qr_code || (editingStudent ? generateQRCode(editingStudent.id) : '');
    
    const submissionData = {
      ...formData,
      qr_code: qrCodeData
    };

    if (editingStudent) {
      await studentsAPI.update(editingStudent.id, submissionData);
      showAlert('Student updated successfully');
    } else {
      const response = await studentsAPI.create(submissionData);
      showAlert('Student created successfully');
      
      // If we have a new student ID, update the QR code with the actual ID
      if (response.data && response.data.id) {
        const updatedQRCode = generateQRCode(response.data.id);
        // Only send the QR code field for update, not the entire form
        await studentsAPI.update(response.data.id, { qr_code: updatedQRCode });
      }
    }
    
    fetchStudents();
    handleCloseDialog();
  } catch (error) {
    console.error('Error saving student:', error);
    showAlert('Error saving student', 'error');
  }
};

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentsAPI.delete(id);
        showAlert('Student deleted successfully');
        fetchStudents();
      } catch (error) {
        showAlert('Error deleting student', 'error');
      }
    }
  };

  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const getSchoolName = (schoolId) => {
    const school = schools.find(s => s.id === schoolId);
    return school ? school.name : 'Loading...';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Student Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Student
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Photo</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>NIP</TableCell>
                  <TableCell>School</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>NFC UID</TableCell>
                  <TableCell>QR Code</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Avatar 
                        src={student.picture} 
                        alt={`${student.first_name} ${student.last_name}`}
                        sx={{ width: 40, height: 40 }}
                      />
                    </TableCell>
                    <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.phone}</TableCell>
                    <TableCell>{student.nip || 'N/A'}</TableCell>
                    <TableCell>
                      {getSchoolName(student.school_id)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={student.status}
                        color={student.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {student.nfc_uid ? (
                        <Chip 
                          label={student.nfc_uid} 
                          color="primary" 
                          variant="outlined"
                          size="small"
                        />
                      ) : (
                        'Not set'
                      )}
                    </TableCell>
                    <TableCell>
                      {student.qr_code ? (
                        <Chip 
                          label="Has QR" 
                          color="success" 
                          variant="outlined"
                          size="small"
                        />
                      ) : (
                        <Chip 
                          label="Missing" 
                          color="error" 
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(student)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => handleShowQR(student)}
                      >
                        <QrCode />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(student.id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingStudent ? 'Edit Student' : 'Add New Student'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sx={{ textAlign: 'center' }}>
                <Tabs
                  value={pictureMode}
                  onChange={(e, newValue) => setPictureMode(newValue)}
                  centered
                  sx={{ mb: 2 }}
                >
                  <Tab icon={<CloudUpload />} label="Upload" value="upload" />
                  <Tab icon={<CameraAlt />} label="Camera" value="camera" />
                </Tabs>

                {pictureMode === 'upload' ? (
                  <>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="picture-upload"
                      type="file"
                      onChange={handlePictureUpload}
                    />
                    <label htmlFor="picture-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUpload />}
                      >
                        Upload Photo
                      </Button>
                    </label>
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      width="100%"
                      style={{ maxWidth: '300px', margin: '0 auto' }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleCapturePhoto}
                      startIcon={<Camera />}
                      sx={{ mt: 2 }}
                    >
                      Capture Photo
                    </Button>
                  </Box>
                )}
                
                {picturePreview && (
                  <Avatar
                    src={picturePreview}
                    sx={{ width: 100, height: 100, margin: '10px auto' }}
                  />
                )}
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date of Birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Birth Country"
                  value={formData.birth_country}
                  onChange={(e) => setFormData({ ...formData, birth_country: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="NIP"
                  value={formData.nip}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="CNSS Number"
                  value={formData.cnss_number}
                  onChange={(e) => setFormData({ ...formData, cnss_number: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="CNAMGS Number"
                  value={formData.cnamgs_number}
                  onChange={(e) => setFormData({ ...formData, cnamgs_number: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="NFC UID"
                  value={formData.nfc_uid}
                  onChange={(e) => setFormData({ ...formData, nfc_uid: e.target.value })}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          onClick={handleGenerateNFC}
                          startIcon={<Refresh />}
                          variant="outlined"
                          size="small"
                        >
                          Generate NFC
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="School"
                  select
                  value={formData.school_id}
                  onChange={(e) => setFormData({ ...formData, school_id: e.target.value })}
                  required
                  fullWidth
                >
                  {schools.map((school) => (
                    <MenuItem key={school.id} value={school.id}>
                      {school.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Status"
                  select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  multiline
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingStudent ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={qrDialog} onClose={handleCloseQR}>
        <DialogTitle>
          QR Code for {currentStudent?.first_name} {currentStudent?.last_name}
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          {currentStudent && (
            <QRCodeSVG 
              value={currentStudent.qr_code || generateQRCode(currentStudent.id)} 
              size={256}
            />
          )}
          <Typography variant="body2" sx={{ mt: 2 }}>
            Scan this QR code to view student information
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            URL: {currentStudent?.qr_code || generateQRCode(currentStudent?.id)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQR}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentManagement;
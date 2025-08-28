import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import { Person as StudentIcon } from '@mui/icons-material';
import StudentDossierProgress from './StudentDossierProgress';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/students');
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Students Management
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Students List" />
        <Tab label="Dossier Progress" disabled={!selectedStudent} />
      </Tabs>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Students List</Typography>
            <Card>
              <List>
                {students.map((student, index) => (
                  <Box key={student.id}>
                    <ListItem 
                      button 
                      onClick={() => setSelectedStudent(student)}
                      selected={selectedStudent?.id === student.id}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <StudentIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${student.first_name} ${student.last_name}`}
                        secondary={
                          <>
                            <Typography variant="body2">{student.email}</Typography>
                            <Typography variant="body2">{student.phone}</Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < students.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </Card>
          </Grid>

          {selectedStudent && (
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Student Details</Typography>
              <Card>
                <CardContent>
                  <Typography variant="h6">
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Email: {selectedStudent.email}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Phone: {selectedStudent.phone}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Status: {selectedStudent.status}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {tabValue === 1 && selectedStudent && (
        <StudentDossierProgress studentId={selectedStudent.id} />
      )}
    </Box>
  );
};

export default Students;
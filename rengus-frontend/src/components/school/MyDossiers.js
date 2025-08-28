import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const MyDossiers = () => {
  const [dossiers, setDossiers] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchDossiers();
  }, []);

  const fetchDossiers = async () => {
    try {
      const response = await fetch(`/api/schools/${currentUser.school_id}/dossiers`);
      if (response.ok) {
        const data = await response.json();
        setDossiers(data);
      }
    } catch (error) {
      console.error('Error fetching dossiers:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Dossiers
      </Typography>
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>License Type</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Updated</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dossiers.map((dossier) => (
                  <TableRow key={dossier.id}>
                    <TableCell>{dossier.student_name}</TableCell>
                    <TableCell>{dossier.license_type}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Box width="100%" mr={1}>
                          <LinearProgress 
                            variant="determinate" 
                            value={dossier.progress} 
                          />
                        </Box>
                        <Box minWidth={35}>
                          <Typography variant="body2">{`${dossier.progress}%`}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={dossier.status} 
                        color={getStatusColor(dossier.status)}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(dossier.updated_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MyDossiers;
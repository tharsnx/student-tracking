import "../css/Admin.css";
import * as React from 'react';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SchoolIcon from '@mui/icons-material/School';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

export const Admin = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [masterChecked, setMasterChecked] = useState(true);
  const [phdChecked, setPhdChecked] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:56733/data");
      setStudents(response.data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Call fetchData when the component mounts
  }, []);

  // Function to filter students based on checkboxes
  const getFilteredStudents = () => {
    return students.filter(student => {
      const degreePart = student.degree.split(" ")[0]; // Split the degree

      // Check for Master Degree
      if (masterChecked && phdChecked) {
        return degreePart === "Master_Degree" || degreePart === "PhD";
      } else if (masterChecked) {
        return degreePart === "Master_Degree";
      } else if (phdChecked) {
        return degreePart === "PhD";
      }
      return false; // If neither checkbox is checked, return no students
    });
  };

  const handleView = (stdID) => {
    navigate('/', { state: { stdID } });
  };

  const handleEdit = (stdID) => {
    navigate('/studentfix', { state: { stdID } });
  };

  const handleDelete = async (stdID) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete student with ID: ${stdID}?`);

    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:56733/deleteStudent/${stdID}`);
        await fetchData();
        alert(`Student with ID: ${stdID} has been deleted successfully.`);
      } catch (error) {
        console.error("Error deleting student:", error);
        alert("An error occurred while trying to delete the student.");
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const filteredStudents = getFilteredStudents(); // Apply filtering here

  return (
    <>
      <Grid container spacing={2} sx={{ px: 1 }}>
        <Grid item xs={6} md={6}>
          <Box className="admin-page-header">
            <Box className="left-container">
              {/* <FormGroup> */}
                
                <Button
                  variant="contained"
                  onClick={() => navigate("/alumni")}
                  startIcon={<SchoolIcon />}
                  sx={{
                    justifyContent: 'center',
                    width: '200px',
                    height: '50px',
                    fontSize: '16px',
                    alignItems: 'center',
                    '@media (max-width: 900px)': {
                      width: '150px',
                      height: '45px',
                      fontSize: '14px',
                    },
                    '@media (max-width: 600px)': {
                      width: '120px',
                      height: '40px',
                      fontSize: '12px',
                    },
                  }}
                >
                  Alumni
                </Button>
                {/* <FormControlLabel
                  control={<Checkbox checked={masterChecked} onChange={() => setMasterChecked(!masterChecked)} />}
                  label="Master Degree"
                />
                <FormControlLabel
                  control={<Checkbox checked={phdChecked} onChange={() => setPhdChecked(!phdChecked)} />}
                  label="PhD"
                />
              </FormGroup> */}
            </Box>
          </Box>
        </Grid>

        <Grid item xs={6} md={6}>
          <Box className="right-container"
            sx={{
              display: 'flex',
              padding: '5px',
              flexDirection: 'column',
              alignItems: 'flex-end', // Align to the right horizontally
              justifyContent: 'center', // Center vertically within the container
              gap: '10px',
              height: '100%', // Ensure the container has enough height for vertical centering
            }}
          >
            <Button
              variant="contained"
              onClick={() => navigate("/addstudent")}
              startIcon={<AddIcon />}
              sx={{
                width: '200px',
                height: '50px',
                fontSize: '16px',
                '@media (max-width: 900px)': {
                  width: '150px',
                  height: '45px',
                  fontSize: '14px',
                },
                '@media (max-width: 600px)': {
                  width: '120px',
                  height: '40px',
                  fontSize: '12px',
                },
              }}
            >
              Add Student
            </Button>

            <Button
              variant="contained"
              onClick={() => navigate("/alladmin")}
              startIcon={<SupervisorAccountIcon />}
              sx={{
                width: '200px',
                height: '50px',
                fontSize: '16px',
                '@media (max-width: 900px)': {
                  width: '150px',
                  height: '45px',
                  fontSize: '14px',
                },
                '@media (max-width: 600px)': {
                  width: '120px',
                  height: '40px',
                  fontSize: '12px',
                },
              }}
            >
              Admin
            </Button>
          </Box>

        </Grid>
      </Grid>

      <div className="admin-table-container" style={{ marginTop: '20px' }}>
        <TableContainer component={Paper} sx={{ maxHeight: 440, width: '100%', margin: 'auto', overflowX: 'hidden' }}>
          <Table stickyHeader sx={{ minWidth: 750 }}> {/* Ensure a minimum width */}
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    backgroundColor: '#11009E',
                    color: 'white',
                    textAlign: 'center',
                    width: '5%', // Adjust width for individual columns
                    minWidth: '50px', // Ensure columns don't shrink too small
                  }}
                >
                  No.
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: '#11009E',
                    color: 'white',
                    textAlign: 'center',
                    width: '20%', // Adjust width for individual columns
                    minWidth: '150px',
                  }}
                >
                  Name
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: '#11009E',
                    color: 'white',
                    textAlign: 'center',
                    width: '15%', // Adjust width for individual columns
                    minWidth: '120px',
                  }}
                >
                  Student ID
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: '#11009E',
                    color: 'white',
                    textAlign: 'center',
                    width: '15%', // Adjust width for individual columns
                    minWidth: '100px',
                  }}
                >
                  Degree
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: '#11009E',
                    color: 'white',
                    textAlign: 'center',
                    width: '15%', // Adjust width for individual columns
                    minWidth: '100px',
                  }}
                >
                  Tel
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: '#11009E',
                    color: 'white',
                    textAlign: 'center',
                    width: '10%', // Adjust width for individual columns
                    minWidth: '80px',
                  }}
                >
                  Progress
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: '#11009E',
                    color: 'white',
                    textAlign: 'center',
                    width: '20%', // Adjust width for individual columns
                    minWidth: '150px',
                  }}
                >
                  Edit
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.stdID}>
                  <TableCell>{student.no}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.stdID}</TableCell>
                  <TableCell>{student.degree}</TableCell>
                  <TableCell>{student.tel}</TableCell>
                  <TableCell>{student.progress}</TableCell>
                  <TableCell>
                    <div>
                      <IconButton
                        size="small"
                        onClick={() => handleView(student.stdID)}
                        sx={{ color: '#11009E', '&:hover': { color: 'cyan' } }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(student.stdID)}
                        sx={{ color: 'black', '&:hover': { color: 'yellow' } }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(student.stdID)}
                        sx={{ color: 'red', '&:hover': { color: 'orange' } }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

      </div>

    </>
  );
};

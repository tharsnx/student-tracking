import * as React from 'react';
import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Box, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

export const Alumni = () => {
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState([]);  // State for storing all alumni
  const [open, setOpen] = useState(false); // State for the dialog
  const [alumniToDelete, setAlumniToDelete] = useState(null); // State to track which alumni to delete

  // Fetch alumni from the backend
  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const response = await axios.get("http://localhost:56733/getalumni");  // Adjust the API endpoint if necessary
        console.log(response.data);
        setAlumni(response.data);  // Store the fetched alumni data in state
      } catch (err) {
        console.error("Error fetching alumni", err);
      }
    };

    fetchAlumni();  // Fetch alumni when component mounts
  }, []);

  const handleClickOpen = (alumni) => {
    setAlumniToDelete(alumni); // Set the alumni to delete
    setOpen(true); // Open dialog
  };

  const handleClose = () => {
    setOpen(false); // Close dialog
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:56733/deletealumni/${alumniToDelete.id}`); // Adjust API call to delete alumni
      setAlumni((prev) => prev.filter((a) => a.id !== alumniToDelete.id)); // Remove alumni from state
      alert(`ลบเรียบร้อยแล้ว ${alumniToDelete.name}`); // Confirmation alert
    } catch (error) {
      console.error("Error deleting alumni:", error);
    } finally {
      setOpen(false); // Close dialog after deletion
    }
  };

  return (
    <>
      <Box className="alumni-header">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', marginTop: '20px' }}>
          <Typography variant="h6">
            Alumni Board<br />
          </Typography>
        </Box>
      </Box>

      <Box className="alumni-card-container">
        <Grid container spacing={10}>
          {alumni.map((alumnus, index) => (
            <Grid item xs={12} md={4} sm={6} lg={3} key={alumnus.id || index} sx={{ width: 100 }}>
              <Card className="card-alumni" sx={{ width: 300 }}> {/* Set card width to 100px */}
                <CardMedia
                  sx={{
                    width: '100%', // ให้กว้างพอดีกับการ์ด
                    height: '300px', // ความสูงของการ์ด
                    '@media (max-width: 900px)': {
                      height: '250px', // ความสูงสำหรับหน้าจอที่เล็กกว่า 900px
                    },
                    '@media (max-width: 600px)': {
                      height: '200px', // ความสูงสำหรับหน้าจอที่เล็กกว่า 600px
                    },
                    margin: '0 auto',
                    objectFit: 'cover', // ทำให้รูปครอบคลุมพื้นที่การ์ดแบบสัดส่วน
                  }}
                  image={alumnus.picture ? `data:image/jpeg;base64,${alumnus.picture}` : "pic.png"}
                  title={alumnus.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {alumnus.name.split(" ")[0]}
                    <br />
                    {alumnus.name.split(" ")[1]}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Email: {alumnus.email} <br />
                    Tel: {alumnus.tel}
                  </Typography>
                </CardContent>
                <CardActions>
                  {/* <IconButton
                    size="small"
                    sx={{ color: 'indigo', '&:hover': { color: 'cyan' } }}
                  >
                    <VisibilityIcon />
                  </IconButton>

                  <IconButton
                    size="small"
                    sx={{ color: 'black', '&:hover': { color: 'yellow' } }}
                  >
                    <EditIcon />
                  </IconButton> */}
                  <IconButton
                    size="small"
                    onClick={() => handleClickOpen(alumnus)}  // Pass the alumni info to the delete handler
                    sx={{ color: 'red', '&:hover': { color: 'orange' } }}
                  >
                    {/* <DeleteIcon /> */}
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Dialog for delete confirmation */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            คุณแน่ใจหรือว่าต้องการลบ {alumniToDelete?.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            ไม่
          </Button>
          <Button onClick={handleDelete} color="error">
            ใช่
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

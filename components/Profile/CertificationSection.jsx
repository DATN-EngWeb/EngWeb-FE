import {
  Paper,
  Box,
  Typography,
  Grid,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';

export default function CertificationSection() {
  const [edit, setEdit] = useState(false);
  const [certs, setCerts] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  return (
    <Paper sx={{ mb: 3, p: 3 }}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Certification</Typography>
        <Box gap={1} display="flex">
          {edit && (
            <Button variant="outlined" onClick={() => setEdit(false)}>
              Cancel
            </Button>
          )}
          <Button onClick={() => setEdit(!edit)}>{edit ? 'Save' : 'Edit'}</Button>
        </Box>
      </Box>

      {edit && (
        <Button component="label" sx={{ mb: 2 }}>
          + Add certification
          <input
            hidden
            type="file"
            accept="image/*"
            onChange={(e) => setCerts([...certs, URL.createObjectURL(e.target.files[0])])}
          />
        </Button>
      )}

      <Grid
        container
        spacing={2}
        sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}
      >
        {certs.map((img, idx) => (
          <Grid item key={idx}>
            <Box
              sx={{
                height: 300,
                bgcolor: '#E8EEF2',
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <img
                src={img}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />

              {edit && (
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'white',
                  }}
                  onClick={() => {
                    setSelected(idx);
                    setOpen(true);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Delete certification</DialogTitle>
        <DialogContent>Are you sure you want to delete this certification?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            color="error"
            onClick={() => {
              setCerts(certs.filter((_, i) => i !== selected));
              setOpen(false);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

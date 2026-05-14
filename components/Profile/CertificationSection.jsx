import { Paper, Box, Typography, Grid, Button, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useRef, useState } from 'react';
import { certificationSectionStyles } from '../../styles/Profile/ProfileStyles';

const normalizeCredentials = (credentials) =>
  (credentials || []).map((cred, index) => {
    if (typeof cred === 'string') {
      return { id: null, url: cred, name: `credential_${index}`, isNew: false };
    }

    return {
      id: cred?.id ?? cred?.credential_id ?? null,
      url: cred?.url || cred?.file || cred?.image_url || '',
      name: cred?.name || `credential_${index}`,
      isNew: false,
    };
  });

export default function CertificationSection({
  credentials,
  credentialsChanges,
  setCredentialsChanges,
  onSave,
  isSaving,
  onError,
}) {
  const [edit, setEdit] = useState(false);
  const [certs, setCerts] = useState(() => normalizeCredentials(credentials));
  const originalStateRef = useRef({ certs: [], changes: {} });

  useEffect(() => {
    if (!edit) {
      setCerts(normalizeCredentials(credentials));
    }
  }, [credentials, edit]);

  const handleEditToggle = async () => {
    if (!edit) {
      const normalized = normalizeCredentials(credentials);
      originalStateRef.current = {
        certs: normalized,
        changes: credentialsChanges || {},
      };

      // Initialize credentialsChanges with all existing credentials as 'unchange'
      if (setCredentialsChanges) {
        const initialChanges = {};
        normalized.forEach((cert) => {
          if (cert.id !== null && cert.id !== undefined) {
            initialChanges[cert.id] = { choice: 'unchange' };
          }
        });
        setCredentialsChanges(initialChanges);
      }

      setEdit(true);
      return;
    }

    // Validate credentials count
    if (certs.length < 1) {
      if (onError) onError('At least one credential is required', 'error');
      return;
    }

    if (certs.length > 3) {
      if (onError) onError('Maximum 3 credentials are allowed', 'error');
      return;
    }

    try {
      if (onSave) {
        await onSave();
      }
      setEdit(false);
    } catch (err) {
      if (onError) onError(err.message || 'Failed to update certifications', 'error');
    }
  };

  const handleCancel = () => {
    setCerts(originalStateRef.current.certs || []);
    if (setCredentialsChanges) {
      setCredentialsChanges(originalStateRef.current.changes || {});
    }
    setEdit(false);
  };

  const handleAddCredential = (file) => {
    // Check maximum limit
    if (certs.length >= 3) {
      if (onError) onError('Maximum 3 credentials are allowed', 'error');
      return;
    }

    // Use timestamp to generate unique temporary ID
    const tempId = -Date.now();

    const newCert = {
      id: tempId,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type,
      isNew: true,
      file,
    };

    setCerts((prev) => [...prev, newCert]);
    if (setCredentialsChanges) {
      setCredentialsChanges((prev) => ({
        ...prev,
        [tempId]: { choice: 'upload', file },
      }));
    }
  };

  const handleDeleteCredential = (cert) => {
    if (cert?.isNew) {
      setCerts((prev) => prev.filter((item) => item.id !== cert.id));
      if (setCredentialsChanges) {
        setCredentialsChanges((prev) => {
          const next = { ...prev };
          delete next[cert.id];
          return next;
        });
      }
      return;
    }

    if (!cert?.id && cert?.id !== 0) {
      if (onError) onError('Cannot delete credential without id', 'error');
      return;
    }

    setCerts((prev) => prev.filter((item) => item.id !== cert.id));
    if (setCredentialsChanges) {
      setCredentialsChanges((prev) => ({
        ...prev,
        [cert.id]: { choice: 'remove' },
      }));
    }
  };

  return (
    <Paper sx={{ mb: 3, p: 3 }}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Certification</Typography>
        <Box gap={1} display="flex">
          {edit && (
            <Button onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
          )}
          <Button variant="outlined" onClick={handleEditToggle} disabled={isSaving}>
            {edit ? 'Save' : 'Edit'}
          </Button>
        </Box>
      </Box>

      {edit && (
        <Button component="label" sx={{ mb: 2 }} disabled={certs.length >= 3}>
          + Add certification {certs.length >= 3 && '(Max 3)'}
          <input
            hidden
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              handleAddCredential(file);
            }}
            disabled={certs.length >= 3}
          />
        </Button>
      )}

      <Grid container spacing={2} sx={certificationSectionStyles.gridContainer}>
        {certs.map((cert, idx) => (
          <Grid item key={cert.id ?? idx}>
            <Box sx={certificationSectionStyles.certImage}>
              <img
                src={cert.url}
                alt={cert.name || `credential-${idx}`}
                style={certificationSectionStyles.certImageTag}
              />

              {edit && (
                <IconButton
                  sx={certificationSectionStyles.deleteButton}
                  onClick={() => handleDeleteCredential(cert)}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

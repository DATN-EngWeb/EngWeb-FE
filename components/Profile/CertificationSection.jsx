import {
  Paper,
  Box,
  Typography,
  Grid,
  Button,
  IconButton,
  Dialog,
  DialogContent,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CloseIcon from '@mui/icons-material/Close';
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

const isPdfFile = (url = '', name = '') => {
  const source = `${url} ${name}`.toLowerCase();
  return source.includes('.pdf');
};

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
  const [preview, setPreview] = useState({ open: false, url: '', name: '', isPdf: false });
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
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isValidType =
      allowedTypes.includes(file.type) || ['pdf', 'jpg', 'jpeg', 'png'].includes(fileExtension);

    if (!isValidType) {
      if (onError) onError('Only PDF, JPG, and PNG files are allowed', 'error');
      return;
    }

    // Validate file size (max 5MB)
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeBytes) {
      if (onError) onError('File size must not exceed 5MB', 'error');
      return;
    }

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
        <>
          <Button component="label" sx={{ mb: 1 }} disabled={certs.length >= 3}>
            + Add certification {certs.length >= 3 && '(Max 3)'}
            <input
              hidden
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                handleAddCredential(file);
              }}
              disabled={certs.length >= 3}
            />
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            Accepted: PDF, JPG, PNG (Max 5MB)
          </Typography>
        </>
      )}

      {certs.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 1.5,
          }}
        >
          {certs.map((cert, idx) => (
            <Box
              key={cert.id ?? idx}
              sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '8px',
                bgcolor: '#ffffff',
                border: '1px solid #e3e8ef',
                '&:hover .doc-overlay': {
                  opacity: 1,
                  pointerEvents: 'auto',
                },
              }}
            >
              {isPdfFile(cert.url, cert.name) ? (
                <Box
                  sx={{
                    minHeight: 180,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 1,
                    textAlign: 'center',
                  }}
                >
                  <PictureAsPdfIcon sx={{ color: '#ef4444', fontSize: 42 }} />
                  <Typography sx={{ fontSize: 13, color: '#334155', wordBreak: 'break-word' }}>
                    {cert.name || 'Document.pdf'}
                  </Typography>
                </Box>
              ) : (
                <Box
                  component="img"
                  src={cert.url}
                  alt={cert.name || `credential-${idx}`}
                  sx={{
                    width: '100%',
                    height: 180,
                    objectFit: 'contain',
                    objectPosition: 'center',
                    backgroundColor: '#ffffff',
                    display: 'block',
                  }}
                />
              )}

              {!edit && (
                <Box
                  className="doc-overlay"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(15, 23, 42, 0.35)',
                    opacity: 0,
                    pointerEvents: 'none',
                    transition: 'opacity 0.18s ease',
                  }}
                >
                  <Button
                    startIcon={<VisibilityOutlinedIcon />}
                    onClick={() =>
                      setPreview({
                        open: true,
                        url: cert.url,
                        name: cert.name,
                        isPdf: isPdfFile(cert.url, cert.name),
                      })
                    }
                    sx={{
                      textTransform: 'none',
                      fontSize: 13,
                      minWidth: 96,
                      borderRadius: '8px',
                      bgcolor: '#ffffff',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.16)',
                      '&:hover': {
                        bgcolor: '#f8fafc',
                        borderColor: '#94a3b8',
                      },
                    }}
                  >
                    View
                  </Button>
                </Box>
              )}

              {edit && (
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'white',
                  }}
                  onClick={() => handleDeleteCredential(cert)}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          ))}
        </Box>
      ) : (
        <Typography sx={{ color: '#9aa0a6', fontSize: 14 }}>No documents uploaded</Typography>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={preview.open}
        onClose={() => setPreview({ open: false, url: '', name: '', isPdf: false })}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="h6">{preview.name}</Typography>
          <IconButton
            onClick={() => setPreview({ open: false, url: '', name: '', isPdf: false })}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          {preview.url &&
            (preview.isPdf ? (
              <iframe
                src={preview.url}
                style={{
                  width: '100%',
                  height: '75vh',
                  border: 0,
                  backgroundColor: '#fff',
                }}
                title="PDF Preview"
              />
            ) : (
              <Box
                component="img"
                src={preview.url}
                alt="Preview"
                sx={{
                  width: '100%',
                  maxHeight: '75vh',
                  objectFit: 'contain',
                  display: 'block',
                  backgroundColor: '#fff',
                }}
              />
            ))}
        </DialogContent>
      </Dialog>
    </Paper>
  );
}

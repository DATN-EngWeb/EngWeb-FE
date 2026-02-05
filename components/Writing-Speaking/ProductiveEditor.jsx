import { Box, Paper, Typography, Button } from '@mui/material';
import ClientSideCustomEditor from '../Editor/ClientSideCustomEditor';
import AudioUploader from '../Upload/AudioUploader';
import DeleteIcon from '@mui/icons-material/Delete';
import * as styles from '../../styles/Teacher/productive/ProductiveStyles';

export default function ProductiveEditor({
  question,
  onChange,
  showAudio = false,
  isReadOnly = false,
}) {
  return (
    <Paper sx={{ ...styles.panelPaper, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, marginBottom: '16px' }}>
        <Box sx={{ ...styles.accentBar, backgroundColor: 'error.dark' }} />
        <Typography fontWeight={600} sx={{ color: 'primary.main' }}>
          Question Content
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Description test <span style={{ color: 'red' }}>*</span>
        </Typography>
        <Box className="editor-container">
          <ClientSideCustomEditor
            data={question.description}
            onChange={(data) => onChange('description', data)}
            isReadOnly={isReadOnly}
          />
        </Box>
      </Box>

      {showAudio && (
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
          >
            <Typography variant="body2" sx={{ mb: 1 }}>
              Audio File (Optional)
            </Typography>
            {question.audio && !isReadOnly && (
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => onChange('audio', null)}
                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
              >
                Remove Audio
              </Button>
            )}
          </Box>
          <AudioUploader
            value={question.audio}
            key={question.audio ? 'has-audio' : 'no-audio'}
            onChange={(audio) => onChange('audio', audio)}
            accept="audio/mp3,audio/m4a"
            isReadOnly={isReadOnly}
          />
        </Box>
      )}

      <Box>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Suggestion (Optional)
        </Typography>
        <Box className="editor-container">
          <ClientSideCustomEditor
            data={question.suggestion}
            onChange={(data) => onChange('suggestion', data)}
            isReadOnly={isReadOnly}
          />
        </Box>
      </Box>
    </Paper>
  );
}

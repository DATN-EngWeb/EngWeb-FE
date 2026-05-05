import { Avatar, Box, Paper, Stack, Typography } from '@mui/material';
import { TranslationResult } from './Translation';
import { GrammarResult } from './Grammar';
import { VocabularyResult } from './Vocabulary';
import { BrainstormResult } from './Brainstorm';
import { GeneralResult } from './General';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function formatDateShort(value) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(value));
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const messageMode = message.mode;
  const messageContent = message.content;
  const plainTextContent =
    typeof messageContent === 'string'
      ? messageContent
      : messageContent &&
          typeof messageContent === 'object' &&
          typeof messageContent.message === 'string'
        ? messageContent.message
        : null;
  const createdAtValue = message.created_at ?? 0;
  const createdAtMs =
    typeof createdAtValue === 'number'
      ? createdAtValue
      : createdAtValue
        ? Date.parse(createdAtValue)
        : NaN;

  if (messageMode === 'mode_notice' || message.role === 'system') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 700,
              textAlign: 'center',
              px: 2,
              py: 0.75,
            }}
          >
            --- {messageContent} ---
          </Typography>
        </Box>
      </Box>
    );
  }

  if (isUser) {
    return (
      <Stack direction="row" spacing={1.25} justifyContent="flex-end">
        <Box sx={{ maxWidth: { xs: '90%', md: '78%' } }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              px: 2,
              py: 1.5,
              color: 'text.primary',
              border: 'none',
            }}
          >
            <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              {messageContent}
            </Typography>
          </Paper>

          {!Number.isNaN(createdAtMs) && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 0.75,
                color: 'text.disabled',
                textAlign: 'right',
              }}
            >
              {formatDateShort(createdAtMs)}
            </Typography>
          )}
        </Box>

        <Avatar
          sx={{
            width: 34,
            height: 34,
            bgcolor: 'primary.main',
            boxShadow: '0 10px 24px rgba(255, 133, 75, 0.18)',
          }}
        >
          <AccountCircleIcon />
        </Avatar>
      </Stack>
    );
  }

  return (
    <Stack direction="row" spacing={1.25} justifyContent={isUser ? 'flex-end' : 'flex-start'}>
      <Avatar
        sx={{
          width: 34,
          height: 34,
          bgcolor: 'primary.main',
          boxShadow: '0 10px 24px rgba(83, 40, 34, 0.18)',
        }}
      >
        <AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />
      </Avatar>

      <Box sx={{ maxWidth: { xs: '90%', md: '78%' } }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            px: 2,
            py: 1.5,
            bgcolor: isUser ? 'primary.main' : 'background.paper',
            color: isUser ? 'primary.contrastText' : 'text.primary',
            border: isUser ? 'none' : '1px solid rgba(83, 40, 34, 0.10)',
            boxShadow: isUser ? '0 10px 24px rgba(83, 40, 34, 0.14)' : 'none',
          }}
        >
          {plainTextContent ? (
            <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              {plainTextContent}
            </Typography>
          ) : messageMode === 'grammar' ? (
            <GrammarResult answer={messageContent} />
          ) : messageMode === 'translate' ? (
            <TranslationResult answer={messageContent} />
          ) : messageMode === 'vocabulary' ? (
            <VocabularyResult answer={messageContent} />
          ) : messageMode === 'brainstorm' ? (
            <BrainstormResult answer={messageContent} />
          ) : messageMode === 'mode_notice' ? (
            <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              {messageContent}
            </Typography>
          ) : messageMode === 'general' ? (
            <GeneralResult answer={messageContent} />
          ) : (
            <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              {messageContent}
            </Typography>
          )}
        </Paper>

        {!Number.isNaN(createdAtMs) && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.75,
              color: 'text.disabled',
              textAlign: isUser ? 'right' : 'left',
            }}
          >
            {formatDateShort(createdAtMs)}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

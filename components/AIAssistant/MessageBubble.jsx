import { Avatar, Box, Paper, Stack, Typography } from '@mui/material';
import { TranslationResult } from './Translation';
import { GrammarResult } from './Grammar';
import { VocabularyResult } from './Vocabulary';
import { BrainstormResult } from './Brainstorm';
import { GeneralResult } from './General';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {
  messageBubbleStyles,
  getModeLabel,
  getUserMetaDataStackSx,
  getTimestampTextSx,
} from '../../styles/AIAssistant/MessageBubbleStyles';

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
      <Box sx={messageBubbleStyles.modeNoticeBox}>
        <Box>
          <Typography variant="caption" sx={messageBubbleStyles.modeNoticeText}>
            --- {messageContent} ---
          </Typography>
        </Box>
      </Box>
    );
  }

  if (isUser) {
    return (
      <Stack sx={messageBubbleStyles.userMessageStack}>
        <Box sx={messageBubbleStyles.userMessageBox}>
          <Paper elevation={0} sx={messageBubbleStyles.userMessagePaper}>
            <Typography sx={messageBubbleStyles.userMessageText}>{messageContent}</Typography>
          </Paper>

          {!Number.isNaN(createdAtMs) && (
            <Stack sx={getUserMetaDataStackSx()}>
              <Typography sx={getTimestampTextSx(true)}>{formatDateShort(createdAtMs)}</Typography>
            </Stack>
          )}
        </Box>

        <Avatar sx={messageBubbleStyles.userAvatar}>
          <AccountCircleIcon />
        </Avatar>
      </Stack>
    );
  }

  return (
    <Stack sx={messageBubbleStyles.aiMessageStack}>
      <Avatar sx={messageBubbleStyles.aiAvatar}>
        <AutoAwesomeRoundedIcon sx={messageBubbleStyles.aiAvatarIcon} />
      </Avatar>

      <Box sx={messageBubbleStyles.aiMessageBox}>
        <Paper elevation={0} sx={messageBubbleStyles.aiMessagePaper}>
          {plainTextContent ? (
            <Typography sx={messageBubbleStyles.aiMessageText}>{plainTextContent}</Typography>
          ) : messageMode === 'grammar' ? (
            <GrammarResult answer={messageContent} />
          ) : messageMode === 'translate' ? (
            <TranslationResult answer={messageContent} />
          ) : messageMode === 'vocabulary' ? (
            <VocabularyResult answer={messageContent} />
          ) : messageMode === 'brainstorm' ? (
            <BrainstormResult answer={messageContent} />
          ) : messageMode === 'mode_notice' ? (
            <Typography sx={messageBubbleStyles.aiMessageText}>{messageContent}</Typography>
          ) : messageMode === 'general' ? (
            <GeneralResult answer={messageContent} />
          ) : (
            <Typography sx={messageBubbleStyles.aiMessageText}>{messageContent}</Typography>
          )}
        </Paper>

        {!Number.isNaN(createdAtMs) && (
          <Stack sx={messageBubbleStyles.metaDataStack} justifyContent="flex-start">
            <Typography sx={getTimestampTextSx(false)}>{formatDateShort(createdAtMs)}</Typography>
            {messageMode && messageMode !== 'mode_notice' && (
              <Box sx={messageBubbleStyles.modeBadge}>{getModeLabel(messageMode)}</Box>
            )}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}

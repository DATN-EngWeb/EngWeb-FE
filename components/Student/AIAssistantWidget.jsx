'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Drawer, Fab, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import ConversationSidebar from '../AIAssistant/ConversationSidebar';
import ChatArea from '../AIAssistant/ChatArea';
import chatBotIcon from '../../assets/img/chat-bot.png';
import {
  getConversations,
  getConversationMessages,
  getQuota,
  renameConversation,
  archiveConversation,
  startConversation,
  sendConversationMessage,
} from '../../api/aiAssistant';

export default function AIAssistantWidget() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(false);
  const [recentOpen, setRecentOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [draft, setDraft] = useState('');
  const [selectedMode, setSelectedMode] = useState('general');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [workspaceQuota, setWorkspaceQuota] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingLoading, setEditingLoading] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuConversationId, setMenuConversationId] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const activeConversation = useMemo(
    () =>
      conversations.find(
        (c) =>
          (c.id && c.id === activeConversationId) || (!c.id && c.localId === activeConversationId),
      ) || null,
    [activeConversationId, conversations],
  );

  const activeModeConfig = useMemo(() => {
    const mode = selectedMode || activeConversation?.mode || 'general';
    return {
      id: mode,
      label: mode.charAt(0).toUpperCase() + mode.slice(1),
      chipColor:
        mode === 'translate'
          ? 'success'
          : mode === 'grammar'
            ? 'warning'
            : mode === 'vocabulary'
              ? 'info'
              : mode === 'brainstorm'
                ? 'secondary'
                : 'primary',
    };
  }, [selectedMode, activeConversation?.mode]);

  const getModeLabel = (mode) => {
    if (!mode) return 'General';
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  };

  const normalizeQuota = (value) => {
    const quota = value?.quota ?? value;

    if (!quota || typeof quota !== 'object') return null;

    const remaining = quota.remaining ?? null;
    const limit = quota.limit ?? null;
    const resetAt = quota.reset_at ?? null;

    if (remaining == null && limit == null && !resetAt) return null;

    return {
      ...quota,
      remaining,
      limit,
      reset_at: resetAt,
    };
  };

  const normalizeMessagesMeta = (value, fallbackLimit = 30) => {
    const meta = value?.messages_meta ?? value?.messagesMeta ?? {};
    const messages = Array.isArray(value?.messages) ? value.messages : [];
    const limit = meta.limit ?? value?.limit ?? fallbackLimit;

    return {
      ...meta,
      limit,
      has_more: meta.has_more ?? meta.hasMore ?? (messages.length >= limit ? true : false),
    };
  };

  const buildConversationTitle = (message) => {
    const cleanedMessage = 'Chat: ' + (message || '').replace(/\s+/g, ' ').trim();

    if (!cleanedMessage) return 'New conversation';

    return cleanedMessage.length > 48
      ? `${cleanedMessage.slice(0, 48).trimEnd()}...`
      : cleanedMessage;
  };

  const getPostAssistantMessageContent = (payload) => {
    const resolvedPayload = payload?.data ?? payload;

    if (!resolvedPayload) return null;

    if (typeof resolvedPayload === 'string') {
      return resolvedPayload;
    }

    if (typeof resolvedPayload !== 'object') {
      return null;
    }

    const answerPayload = resolvedPayload.answer;
    if (answerPayload && typeof answerPayload === 'object') {
      return answerPayload.message ?? answerPayload.content ?? answerPayload.answer ?? null;
    }

    return (
      resolvedPayload.content ??
      resolvedPayload.answer ??
      resolvedPayload.message ??
      resolvedPayload.reply ??
      null
    );
  };

  const normalizeFetchedMessage = (message) => {
    if (!message || typeof message !== 'object') return message;

    const content = message.content;
    if (
      content &&
      typeof content === 'object' &&
      typeof content.message === 'string' &&
      content.message.trim()
    ) {
      return {
        ...message,
        content: content.message,
      };
    }

    return message;
  };

  const refreshConversationMessages = async (conversationId, fallbackConversation) => {
    const limit = fallbackConversation?.messages_meta?.limit || 30;
    const details = await getConversationMessages(conversationId, { limit });
    const normalizedMessages = Array.isArray(details?.messages)
      ? details.messages.map(normalizeFetchedMessage)
      : [];
    const normalizedQuota = normalizeQuota(details?.quota);
    const normalizedMessagesMeta = normalizeMessagesMeta(
      {
        ...details,
        messages: normalizedMessages,
      },
      limit,
    );

    if (normalizedQuota) setWorkspaceQuota(normalizedQuota);

    let refreshedConversation = null;

    setConversations((prev) =>
      prev.map((conversation) => {
        const isTarget =
          conversation.id === conversationId || conversation.localId === conversationId;

        if (!isTarget) return conversation;

        refreshedConversation = {
          ...conversation,
          ...details,
          id: details?.id || conversation.id || conversationId,
          localId: conversation.localId,
          messages: normalizedMessages,
          messages_meta: normalizedMessagesMeta,
          isDraft: false,
        };

        return refreshedConversation;
      }),
    );

    return refreshedConversation;
  };

  const fetchWorkspaceQuota = async () => {
    try {
      const quotaResponse = await getQuota();
      const quota = normalizeQuota(quotaResponse);
      setWorkspaceQuota(quota);
      return quota;
    } catch {
      setWorkspaceQuota(null);
      return null;
    }
  };

  const appendModeNotice = (conversationId, mode) => {
    const noticeMessage = {
      id: `mode-notice-${Date.now()}`,
      role: 'system',
      mode: 'mode_notice',
      content: `Mode changed to ${getModeLabel(mode)}`,
      createdAt: Date.now(),
    };

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId || conversation.localId === conversationId
          ? {
              ...conversation,
              messages: [...(conversation.messages || []), noticeMessage],
            }
          : conversation,
      ),
    );
  };

  useEffect(() => {
    setIsLoading(true);
    const getConversationsAsync = async () => {
      try {
        const [res, quotaResponse] = await Promise.all([getConversations(), getQuota()]);
        setConversations(Array.isArray(res) ? res : []);
        setWorkspaceQuota(normalizeQuota(quotaResponse));
        setError(null);
      } catch {
        setError('Failed to load conversations');
        setWorkspaceQuota(null);
      } finally {
        setIsLoading(false);
      }
    };
    getConversationsAsync();
  }, []);

  const handleCreateConversation = (mode = 'general') => {
    const localId = `local-${Date.now()}`;
    const draftConversation = {
      localId,
      title: 'New conversation',
      mode,
      level: selectedLevel,
      messages: [],
      isDraft: true,
    };

    setConversations((prev) => [draftConversation, ...prev]);
    setActiveConversationId(localId);
    setSelectedMode(mode || 'general');
    setSelectedLevel(selectedLevel || 'all');
    setOpen(true);
  };

  const handleOpenConversation = async (conv) => {
    try {
      const details = await getConversationMessages(conv.id);
      const normalizedQuota = normalizeQuota(details?.quota);
      const normalizedMessagesMeta = normalizeMessagesMeta(details, 30);

      // update global workspaceQuota if server returned quota
      if (normalizedQuota) setWorkspaceQuota(normalizedQuota);

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conv.id
            ? {
                ...c,
                ...details,
                messages_meta: normalizedMessagesMeta,
              }
            : c,
        ),
      );
      setActiveConversationId(conv.id);
      setSelectedMode(details?.mode || 'general');
      setSelectedLevel(details?.level || 'all');
      setOpen(true);
    } catch {
      setError('Failed to load conversation');
    }
  };

  const handleLoadMoreMessages = async () => {
    if (!activeConversation?.id || isLoadingMoreMessages) return;

    const currentMessages = activeConversation.messages || [];
    const oldestMessage = currentMessages[0];
    const beforeId = oldestMessage?.id;
    const requestLimit = activeConversation?.messages_meta?.limit || 30;

    if (!beforeId) return;

    setIsLoadingMoreMessages(true);

    try {
      const details = await getConversationMessages(activeConversation.id, {
        limit: requestLimit,
        beforeId,
      });

      const olderMessages = Array.isArray(details?.messages) ? details.messages : [];
      const normalizedMessagesMeta = {
        ...normalizeMessagesMeta(details, requestLimit),
        has_more: olderMessages.length >= requestLimit,
      };

      prependMessagesToConversation(activeConversation.id, olderMessages, normalizedMessagesMeta);
    } catch {
      setError('Failed to load more messages');
    } finally {
      setIsLoadingMoreMessages(false);
    }
  };

  const handleMenuOpen = (event, conversationId) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setMenuConversationId(conversationId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuConversationId(null);
  };

  const handleMenuEdit = (event, conversation) => {
    event.stopPropagation();
    setEditingId(conversation.id || conversation.localId);
    setEditingTitle(conversation.title || '');
    handleMenuClose();
  };

  const handleEditTitleChange = (value) => {
    setEditingTitle(value);
  };

  const handleCancelEditConversation = (event) => {
    event?.stopPropagation?.();
    setEditingId(null);
    setEditingTitle('');
    handleMenuClose();
  };

  const handleSaveEditConversation = async (conversationKey) => {
    const nextTitle = editingTitle.trim();

    if (!nextTitle) {
      setError('Conversation title cannot be empty');
      return;
    }

    const targetConversation = conversations.find(
      (conversation) =>
        conversation.id === conversationKey || conversation.localId === conversationKey,
    );

    if (!targetConversation?.id) {
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.localId === conversationKey
            ? {
                ...conversation,
                title: nextTitle,
              }
            : conversation,
        ),
      );
      setEditingId(null);
      setEditingTitle('');
      handleMenuClose();
      setError(null);
      return;
    }

    setEditingLoading(true);

    try {
      const updatedConversation = await renameConversation({
        conversationId: targetConversation.id,
        title: nextTitle,
      });

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === targetConversation.id || conversation.localId === conversationKey
            ? {
                ...conversation,
                ...updatedConversation,
                title: updatedConversation?.title || nextTitle,
              }
            : conversation,
        ),
      );
      setEditingId(null);
      setEditingTitle('');
      handleMenuClose();
      setError(null);
    } catch {
      setError('Failed to rename conversation');
    } finally {
      setEditingLoading(false);
    }
  };

  const handleMenuArchive = async (event, conversation) => {
    event?.stopPropagation?.();
    handleMenuClose();

    if (!conversation?.id) {
      setConversations((prev) =>
        prev.filter((item) =>
          conversation.localId ? item.localId !== conversation.localId : item !== conversation,
        ),
      );
      if (
        activeConversation &&
        ((conversation.localId && activeConversation.localId === conversation.localId) ||
          activeConversation === conversation)
      ) {
        handleCreateConversation('general');
      }
      return;
    }

    try {
      await archiveConversation(conversation.id);
      setConversations((prev) => prev.filter((item) => item.id !== conversation.id));
      if (activeConversationId === conversation.id) {
        handleCreateConversation('general');
      }
      setError(null);
    } catch {
      setError('Failed to archive conversation');
    }
  };

  const appendMessageToConversation = (conversationId, message) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId || conversation.localId === conversationId
          ? {
              ...conversation,
              messages: [...(conversation.messages || []), message],
            }
          : conversation,
      ),
    );
  };

  const prependMessagesToConversation = (conversationId, messages, messagesMeta) => {
    setConversations((prev) =>
      prev.map((conversation) => {
        const isTarget =
          conversation.id === conversationId || conversation.localId === conversationId;

        if (!isTarget) return conversation;

        const currentMessages = conversation.messages || [];
        const currentMessageKeys = new Set(
          currentMessages.map((message) => message?.id).filter(Boolean),
        );

        const nextMessages = [
          ...messages.filter((message) => !message?.id || !currentMessageKeys.has(message.id)),
          ...currentMessages,
        ];

        return {
          ...conversation,
          messages: nextMessages,
          messages_meta: {
            ...(conversation.messages_meta || {}),
            ...(messagesMeta || {}),
          },
        };
      }),
    );
  };

  const handleSend = async () => {
    const quotaRemaining = workspaceQuota?.remaining ?? null;
    if (quotaRemaining != null && quotaRemaining <= 0) {
      setError('Quota exceeded. Please wait until reset time.');
      return;
    }

    const text = draft.trim();
    if (!text) return;

    setError(null);
    setDraft('');
    setIsThinking(true);

    let pendingUserMessageId = null;
    let pendingConversationId = null;

    try {
      let conversation = activeConversation;

      if (!conversation || !conversation.id) {
        const newConv = await startConversation({
          mode: conversation?.mode || selectedMode || 'general',
          level: selectedLevel !== 'all' ? selectedLevel : undefined,
        });
        const nextTitle = buildConversationTitle(text);
        if (!workspaceQuota) await fetchWorkspaceQuota();
        const mergedConversation = {
          ...conversation,
          ...newConv,
          localId: conversation?.localId,
          isDraft: false,
          title:
            conversation?.title && conversation.title !== 'New conversation'
              ? conversation.title
              : nextTitle,
          messages: conversation?.messages || [],
        };

        setConversations((prev) => {
          if (conversation?.localId) {
            return prev.map((item) =>
              item.localId === conversation.localId ? mergedConversation : item,
            );
          }

          return [mergedConversation, ...prev];
        });

        conversation = mergedConversation;
        setActiveConversationId(conversation.id);
        setConversations((prev) =>
          prev.map((item) =>
            item.id === conversation.id || item.localId === conversation.localId
              ? {
                  ...item,
                  title: item.title && item.title !== 'New conversation' ? item.title : nextTitle,
                }
              : item,
          ),
        );
      }

      const userMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        mode: conversation.mode || selectedMode || 'general',
        content: text,
        created_at: Date.now(),
      };

      pendingUserMessageId = userMessage.id;
      pendingConversationId = conversation.id;

      appendMessageToConversation(conversation.id, userMessage);

      const response = await sendConversationMessage({
        conversationId: conversation.id,
        message: text,
        mode: selectedMode || conversation.mode || 'general',
        context: selectedLevel !== 'all' ? { level: selectedLevel } : undefined,
      });

      const respQuota = normalizeQuota(response?.quota);
      if (respQuota) setWorkspaceQuota(respQuota);

      const refreshedConversation = await refreshConversationMessages(
        conversation.id,
        conversation,
      );

      if (refreshedConversation?.id) {
        setActiveConversationId(refreshedConversation.id);
      } else {
        setActiveConversationId(conversation.id);
      }

      setError(null);
    } catch {
      if (pendingUserMessageId && pendingConversationId) {
        setConversations((prev) =>
          prev.map((conversation) => {
            const isTarget =
              conversation.id === pendingConversationId ||
              conversation.localId === pendingConversationId;

            if (!isTarget) return conversation;

            return {
              ...conversation,
              messages: (conversation.messages || []).filter(
                (message) => message?.id !== pendingUserMessageId,
              ),
            };
          }),
        );
      }
      setError('Failed to send message');
    } finally {
      setIsThinking(false);
    }
  };

  const handleModeChange = (nextMode) => {
    const currentMode = selectedMode || activeConversation?.mode || 'general';

    setSelectedMode(nextMode);

    if (activeConversation && activeConversation.id && nextMode && nextMode !== currentMode) {
      appendModeNotice(activeConversation.id, nextMode);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCloseAssistant = () => {
    setOpen(false);
    setRecentOpen(false);
  };

  return (
    <Box
      className="ai-assistant-root"
      sx={{ fontFamily: `'Source Sans 3', 'Be Vietnam Pro', 'Inter', sans-serif` }}
    >
      <Tooltip
        title={
          <span style={{ fontFamily: `'Source Sans 3', 'Be Vietnam Pro', 'Inter', sans-serif` }}>
            Open AI Assistant
          </span>
        }
        placement="left"
      >
        <Fab
          color={open ? 'default' : 'primary'}
          onClick={() => setOpen(true)}
          sx={{
            display: open ? 'none' : 'flex',
            position: 'fixed',
            right: { xs: 16, md: 28 },
            bottom: { xs: 16, md: 28 },
            zIndex: (theme) => theme.zIndex.drawer + 20,
            width: 58,
            height: 58,
            boxShadow: '0 10px 22px rgba(0, 0, 0, 0.18)',
            fontFamily: `'Source Sans 3', 'Be Vietnam Pro', 'Inter', sans-serif`,
          }}
        >
          <Box
            component="img"
            src={chatBotIcon.src ?? chatBotIcon}
            alt="AI Assistant"
            sx={{ width: 35, height: 35, objectFit: 'contain' }}
          />
        </Fab>
      </Tooltip>

      <Drawer
        anchor="right"
        open={open}
        onClose={handleCloseAssistant}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          className: 'ai-assistant-root',
          sx: {
            width: { xs: '100vw', md: '80vw' },
            maxWidth: '100vw',
            borderTopLeftRadius: { xs: 0, md: 28 },
            borderBottomLeftRadius: { xs: 0, md: 28 },
            bgcolor: 'transparent',
            background:
              'linear-gradient(135deg, rgba(255, 248, 240, 0.98) 0%, rgba(255, 252, 247, 0.98) 48%, rgba(251, 242, 231, 0.98) 100%)',
            fontFamily: `'Source Sans 3', 'Be Vietnam Pro', 'Inter', sans-serif`,
            boxShadow: '0 24px 70px rgba(82, 56, 28, 0.20)',
            overflow: 'hidden',
            '& *': {
              fontFamily: `'Source Sans 3', 'Be Vietnam Pro', 'Inter', sans-serif !important`,
            },
          },
        }}
      >
        {isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            <ChatArea
              activeConversation={activeConversation}
              activeMode={selectedMode || activeConversation?.mode || 'general'}
              activeModeConfig={activeModeConfig}
              selectedLevel={selectedLevel}
              draft={draft}
              isThinking={isThinking}
              canLoadMoreMessages={
                !!activeConversation?.id &&
                (activeConversation?.messages_meta?.has_more ??
                  (activeConversation?.messages || []).length >=
                    (activeConversation?.messages_meta?.limit || 30))
              }
              isLoadingMoreMessages={isLoadingMoreMessages}
              quota={workspaceQuota}
              quotaRemaining={workspaceQuota?.remaining ?? null}
              error={error}
              inputRef={inputRef}
              onDraftChange={(value) => {
                if (error) setError(null);
                setDraft(value);
              }}
              onKeyDown={handleKeyDown}
              onSend={handleSend}
              onModeChange={handleModeChange}
              onLevelChange={setSelectedLevel}
              onLoadMoreMessages={handleLoadMoreMessages}
              onClearError={() => setError(null)}
              onClose={handleCloseAssistant}
              onOpenRecentConversations={() => setRecentOpen(true)}
              showSidebarToggle
            />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '25% 75%',
              height: '100%',
              minHeight: 0,
            }}
          >
            <ConversationSidebar
              conversations={conversations}
              isLoading={isLoading}
              activeConversationId={activeConversationId}
              isCreatingConversation={isCreatingConversation}
              editingId={editingId}
              editingTitle={editingTitle}
              editingLoading={editingLoading}
              menuAnchorEl={menuAnchorEl}
              menuConversationId={menuConversationId}
              onClose={handleCloseAssistant}
              onCreateConversation={handleCreateConversation}
              onOpenConversation={handleOpenConversation}
              onEditTitleChange={handleEditTitleChange}
              onSaveEditConversation={handleSaveEditConversation}
              onCancelEditConversation={handleCancelEditConversation}
              onMenuOpen={handleMenuOpen}
              onMenuClose={handleMenuClose}
              onMenuEdit={handleMenuEdit}
              onMenuArchive={handleMenuArchive}
            />

            <ChatArea
              activeConversation={activeConversation}
              activeMode={selectedMode || activeConversation?.mode || 'general'}
              activeModeConfig={activeModeConfig}
              selectedLevel={selectedLevel}
              draft={draft}
              isThinking={isThinking}
              canLoadMoreMessages={
                !!activeConversation?.id &&
                (activeConversation?.messages_meta?.has_more ??
                  (activeConversation?.messages || []).length >=
                    (activeConversation?.messages_meta?.limit || 30))
              }
              isLoadingMoreMessages={isLoadingMoreMessages}
              quota={workspaceQuota}
              quotaRemaining={workspaceQuota?.remaining ?? null}
              error={error}
              inputRef={inputRef}
              onDraftChange={(value) => {
                if (error) setError(null);
                setDraft(value);
              }}
              onKeyDown={handleKeyDown}
              onSend={handleSend}
              onModeChange={handleModeChange}
              onLevelChange={setSelectedLevel}
              onLoadMoreMessages={handleLoadMoreMessages}
              onClearError={() => setError(null)}
              onClose={handleCloseAssistant}
            />
          </Box>
        )}
      </Drawer>

      <Drawer
        anchor="left"
        open={isMobile && recentOpen}
        onClose={() => setRecentOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: 'min(88vw, 360px)',
            maxWidth: '88vw',
            bgcolor: 'background.paper',
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20,
          },
        }}
      >
        <ConversationSidebar
          conversations={conversations}
          isLoading={isLoading}
          activeConversationId={activeConversationId}
          isCreatingConversation={isCreatingConversation}
          editingId={editingId}
          editingTitle={editingTitle}
          editingLoading={editingLoading}
          menuAnchorEl={menuAnchorEl}
          menuConversationId={menuConversationId}
          onClose={() => setRecentOpen(false)}
          onCreateConversation={handleCreateConversation}
          onOpenConversation={(conversation) => {
            handleOpenConversation(conversation);
            setRecentOpen(false);
          }}
          onEditTitleChange={handleEditTitleChange}
          onSaveEditConversation={handleSaveEditConversation}
          onCancelEditConversation={handleCancelEditConversation}
          onMenuOpen={handleMenuOpen}
          onMenuClose={handleMenuClose}
          onMenuEdit={handleMenuEdit}
          onMenuArchive={handleMenuArchive}
        />
      </Drawer>
    </Box>
  );
}

/* global URLSearchParams */
'use client';

import { useEffect, useState } from 'react';
import {
  Paper,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  Pagination,
  InputAdornment,
  Container,
} from '@mui/material';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import ForumPostCard from './ForumPostCard';
import { getPosts } from '../../api/forum';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ProductiveMetaPanel from '../Teacher/ProductiveMetaPanel';
import ProductivePreview from '../Writing-Speaking/ProductivePreview';

export default function ForumPostsPageContent({
  testId,
  subtitle,
  showTabs = true,
  defaultOrdering = '-created_at',
  previewData = null,
  metadata = null,
  testContextLoading = false,
}) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [ordering, setOrdering] = useState(defaultOrdering);
  const [search, setSearch] = useState('');
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tab = showTabs && searchParams.get('tab') === 'your-posts' ? 1 : 0;

  const handleTabChange = (_, newValue) => {
    if (!showTabs) {
      return;
    }

    const next = new URLSearchParams(searchParams.toString());

    if (newValue === 1) next.set('tab', 'your-posts');
    else next.delete('tab');

    next.delete('page');
    setPage(1);
    router.push(`${pathname}?${next.toString()}`);
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const queryParams = { page, ordering, page_size: 5 };

        if (search) queryParams.search = search;
        if (showTabs && tab === 1) queryParams.filter = 'mine';

        const response = await getPosts({ test_id: testId, ...queryParams });

        setPosts(response.results || []);
        setCount(response.count || 0);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching posts:', error);
      }
    };

    if (testId) {
      fetchPosts();
    }
  }, [page, ordering, search, tab, testId, showTabs]);

  const renderTestContextContent = () => {
    if (testContextLoading) {
      return (
        <Card variant="outlined" sx={{ borderRadius: 3, gridColumn: '1 / -1' }}>
          <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={18} />
            <Typography color="text.secondary">Loading test preview...</Typography>
          </CardContent>
        </Card>
      );
    }

    if (!previewData) {
      return (
        <Card variant="outlined" sx={{ borderRadius: 3, gridColumn: '1 / -1' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography color="text.secondary">
              Test content is unavailable right now. You can still review posts below.
            </Typography>
          </CardContent>
        </Card>
      );
    }

    return (
      <>
        <Box sx={{ height: 'fit-content' }}>
          <ProductiveMetaPanel metadata={metadata || {}} />
        </Box>
        <ProductivePreview
          title={previewData.title}
          description={previewData.description}
          suggestion={previewData.suggestion}
          audio={previewData.audio}
          preview={false}
        />
      </>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 5, md: 10, lg: 15 } }}>
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          bgcolor: '#fff',
        }}
      >
        <Typography variant="h4" fontWeight={700} mb={0.5} sx={{ color: 'primary.main' }}>
          Our Forum
        </Typography>

        <Typography color="text.secondary">{subtitle}</Typography>
      </Paper>

      <Box
        display="flex"
        justifyContent={showTabs ? 'space-between' : 'flex-end'}
        alignItems="center"
        mb={3}
      >
        {showTabs ? (
          <Tabs
            value={tab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTabs-indicator': { display: 'none' },
              '& .MuiTab-root': {
                borderRadius: '999px',
                textTransform: 'none',
                fontWeight: 700,
                color: 'primary.main',
                minHeight: 36,
                px: 2.5,
                py: 0.5,
                border: '1.5px solid',
                borderColor: 'primary.main',
                mr: 1,
              },
              '& .Mui-selected': {
                bgcolor: 'primary.main',
                color: '#fff !important',
              },
            }}
          >
            <Tab label="All" />
            <Tab label="Your posts" />
          </Tabs>
        ) : null}

        <Box display="flex" gap={1.5} alignItems="center">
          {!showTabs ? (
            <Button
              variant="outlined"
              startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 20 }} />}
              onClick={() => setIsTestModalOpen(true)}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                fontWeight: 700,
                minWidth: 140,
                height: 40,
                px: 2,
                bgcolor: 'transparent',
                color: 'primary.main',
                borderColor: 'primary.main',
                boxShadow: 'none',
                '&:hover': {
                  borderColor: 'primary.dark',
                  bgcolor: 'transparent',
                  boxShadow: 'none',
                },
              }}
            >
              Show Test
            </Button>
          ) : null}

          <TextField
            placeholder="Find post"
            size="small"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            sx={{ width: 200 }}
            slotProps={{
              input: {
                sx: { height: 40 },
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: '#999' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Select
            value={ordering}
            size="small"
            onChange={(e) => {
              setOrdering(e.target.value);
              setPage(1);
            }}
            sx={{
              minWidth: 130,
              height: 40,
              borderRadius: 2,
              fontSize: 14,
              '& .MuiSelect-select': {
                height: 40,
                display: 'flex',
                alignItems: 'center',
                py: 0,
              },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ccc' },
            }}
          >
            <MenuItem value="-created_at">Newest</MenuItem>
            <MenuItem value="-like_count">Most liked</MenuItem>
          </Select>
        </Box>
      </Box>

      {posts.length > 0 ? (
        posts.map((post) => (
          <ForumPostCard
            key={post.id}
            post={post}
            initialOpen={String(post.id) === searchParams.get('open_post')}
          />
        ))
      ) : (
        <Typography textAlign="center" color="text.secondary" py={6}>
          No posts found.
        </Typography>
      )}

      <Box display="flex" justifyContent="center" mt={4} mb={4}>
        <Pagination
          count={Math.ceil(count / 5) || 1}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
          shape="rounded"
          size="large"
        />
      </Box>

      {!showTabs ? (
        <Dialog
          open={isTestModalOpen}
          onClose={() => setIsTestModalOpen(false)}
          fullWidth={false}
          maxWidth="lg"
          PaperProps={{
            sx: {
              width: { xs: '95vw', md: '88vw' },
              maxWidth: '1100px',
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 800, color: 'primary.main', pr: 7 }}>
            Test Preview
            <IconButton
              aria-label="Close test preview"
              onClick={() => setIsTestModalOpen(false)}
              sx={{ position: 'absolute', right: 10, top: 10 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 1, pb: 2.5, maxHeight: '78vh', overflowY: 'auto' }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '300px minmax(0, 1fr)' },
                gap: 2,
                alignItems: 'start',
              }}
            >
              {renderTestContextContent()}
            </Box>
          </DialogContent>
        </Dialog>
      ) : null}
    </Container>
  );
}

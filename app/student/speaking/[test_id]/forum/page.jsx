/* global URLSearchParams */
'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  Pagination,
  InputAdornment,
} from '@mui/material';
import { useParams, useRouter, useSearchParams, usePathname } from 'next/navigation';
import ForumPostCard from '../../../../../components/Forum/ForumPostCard';
import { getPosts } from '../../../../../api/forum';
import SearchIcon from '@mui/icons-material/Search';

export default function ForumPage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [ordering, setOrdering] = useState('-created_at');
  const [search, setSearch] = useState('');
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') === 'your-posts' ? 1 : 0;

  const handleTabChange = (_, newValue) => {
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
        const queryParams = { page, ordering };
        if (search) queryParams.search = search;
        if (tab === 1) queryParams.filter = 'mine';
        const response = await getPosts({ test_id: params.test_id, ...queryParams });
        setPosts(response.results || []);
        setCount(response.count || 0);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    fetchPosts();
  }, [page, ordering, search, tab, params.test_id]);

  return (
    <Box maxWidth={800} mx="auto" mt={4} px={2}>
      <Typography variant="h4" fontWeight={700} mb={0.5} sx={{ color: 'primary.main' }}>
        Our Forum
      </Typography>

      <Typography color="text.secondary" mb={3}>
        Share your Speaking to get feedback from our community
      </Typography>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-indicator': { display: 'none' },
            '& .MuiTab-root': {
              borderRadius: '999px',
              textTransform: 'none',
              fontWeight: 700,
              color: '#4e342e',
              minHeight: 36,
              px: 2.5,
              py: 0.5,
              border: '1.5px solid #4e342e',
              mr: 1,
            },
            '& .Mui-selected': {
              bgcolor: '#4e342e',
              color: '#fff !important',
            },
          }}
        >
          <Tab label="All" />
          <Tab label="Your posts" />
        </Tabs>

        <Box display="flex" gap={1.5} alignItems="center">
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
              borderRadius: 2,
              fontSize: 14,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ccc' },
            }}
          >
            <MenuItem value="-created_at">Newest</MenuItem>
            <MenuItem value="-like_count">Most liked</MenuItem>
          </Select>
        </Box>
      </Box>

      {posts.length > 0 ? (
        posts.map((post) => <ForumPostCard key={post.id} post={post} />)
      ) : (
        <Typography textAlign="center" color="text.secondary" py={6}>
          No posts found.
        </Typography>
      )}

      <Box display="flex" justifyContent="center" mt={4} mb={4}>
        <Pagination
          count={Math.ceil(count / 10) || 1}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
          shape="rounded"
          size="large"
        />
      </Box>
    </Box>
  );
}

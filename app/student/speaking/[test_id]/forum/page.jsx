/* global URLSearchParams */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ForumPostsPageContent from '../../../../../components/Forum/ForumPostsPageContent';
import { fetchHtmlContent, getProductiveTestDetails } from '../../../../../api/test';

export default function ForumPage() {
  const params = useParams();
  const [previewData, setPreviewData] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [contextLoading, setContextLoading] = useState(true);

  useEffect(() => {
    const fetchTestContext = async () => {
      if (!params?.test_id) return;
      setContextLoading(true);
      try {
        const response = await getProductiveTestDetails(params.test_id);
        let description = response.productive_test?.description || '';
        if (description?.startsWith('http')) {
          description = await fetchHtmlContent(description);
        }
        setPreviewData({
          title: response.title || '',
          description,
          suggestion: response.productive_test?.glue_text || '',
          audio: response.productive_test?.glue_resources?.audio || null,
        });
        setMetadata({
          level: response.level || '',
          time: response.time,
          topic: response.productive_test?.topic || '',
          format: response.productive_test?.format || '',
          minWord: response.productive_test?.min_word,
          showMinWord: false,
          audio: response.productive_test?.glue_resources?.audio || null,
          image: response.productive_test?.glue_resources?.image || null,
          descriptionInfo: response.description || null,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setContextLoading(false);
      }
    };
    fetchTestContext();
  }, [params?.test_id]);

  return (
    <ForumPostsPageContent
      testId={params?.test_id}
      subtitle="Share your Speaking to get feedback from our community"
      showTabs
      previewData={previewData}
      metadata={metadata}
      testContextLoading={contextLoading}
    />
  );
}

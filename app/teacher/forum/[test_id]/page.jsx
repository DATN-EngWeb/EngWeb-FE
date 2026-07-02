'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ForumPostsPageContent from '../../../../components/Forum/ForumPostsPageContent';
import { fetchHtmlContent, getProductiveTestDetails } from '../../../../api/test';

export default function TeacherTestForumPage() {
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
        if (description) {
          const htmlContent = await fetchHtmlContent(description);
          description = htmlContent;
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
          descriptionInfo: response.description || '',
          format: response.productive_test?.format || '',
          minWord: response.productive_test?.min_word,
          showMinWord: false,
          audio: response.productive_test?.glue_resources?.audio || null,
          image: response.productive_test?.glue_resources?.image || null,
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
      subtitle="View all posts for this test"
      showTabs={false}
      previewData={previewData}
      metadata={metadata}
      testContextLoading={contextLoading}
    />
  );
}

'use client';

import React from 'react';
import ReadingTestContent from '@/components/Student/ReadingTest/ReadingTestContent';

export default function Page({ params }) {
  const unwrappedParams = React.use(params);
  const { test_id } = unwrappedParams;

  return <ReadingTestContent testId={test_id} />;
}

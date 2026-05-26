'use client';

import React from 'react';
import ListeningTestContent from '../../../../../components/Student/ListeningTest/ListeningTestContent';

export default function Page({ params }) {
  const unwrappedParams = React.use(params);
  const { test_id } = unwrappedParams;

  return <ListeningTestContent test_id={test_id} />;
}

'use client';

import React, { useEffect, useState } from 'react';
import ListeningTestContent from '../../../../../components/Student/ListeningTest/ListeningTestContent';
import ReceptiveTestResult from '../../../../../components/Student/ReceptiveTestResult/ReceptiveTestResult';

export default function Page({ params }) {
  const unwrappedParams = React.use(params);
  const { test_id } = unwrappedParams;

  return <ListeningTestContent test_id={test_id} />;
}

import { Suspense } from 'react';
// import { cookies } from 'next/headers';
import Skeleton from '../../../../components/Student/ListeningTest/skeleton';
import ListeningTestContent from '../../../../components/Student/ListeningTest/ListeningTestContent';
// import { getRecepiveTestDetails } from '../../../../../api/teacher/upload-reading';

export default async function Page({ params }) {
  const { test_id } = params;

  // const cookieStore = await cookies();
  // const token = cookieStore.get('accessToken')?.value;

  // const initialData = await getRecepiveTestDetails(test_id, token);

  return (
    <Suspense fallback={<Skeleton />}>
      <ListeningTestContent test_id={test_id} />
    </Suspense>
  );
}

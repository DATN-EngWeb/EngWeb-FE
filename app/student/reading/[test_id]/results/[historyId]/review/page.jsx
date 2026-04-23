import ReceptiveTestResult from '@/components/Student/ReceptiveTestResult/ReceptiveTestResult';

export default async function ReceptiveReviewPage({ params }) {
  const resolvedParams = await params;
  return <ReceptiveTestResult mode="review" params={resolvedParams} />;
}

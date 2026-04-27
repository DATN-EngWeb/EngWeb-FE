import ReceptiveTestResult from '@/components/Student/ReceptiveTestResult/ReceptiveTestResult';

export default async function ReceptiveResultsPage({ params }) {
  const resolvedParams = await params;
  return <ReceptiveTestResult mode="summary" params={resolvedParams} />;
}

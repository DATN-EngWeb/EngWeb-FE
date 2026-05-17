import { Suspense } from 'react';
import ListeningTestEditor from '../../../../components/ListeningTest/ListeningTestEditor';

export default function CreateListeningTestPage() {
  return (
    <Suspense fallback={null}>
      <ListeningTestEditor />
    </Suspense>
  );
}

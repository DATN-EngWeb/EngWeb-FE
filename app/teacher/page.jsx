import Link from 'next/link';
import Header from '../../components/Home/Header';
import Footer from '../../components/Home/Footer';

export default function Page() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Teacher</h1>
      <p>
        <Link href="/teacher/upload-reading">Đi tới Upload Reading</Link>
      </p>
    </main>
  );
}

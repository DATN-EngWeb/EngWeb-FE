import Header from '../../components/Home/Header';
import Footer from '../../components/Home/Footer';

export default function TeacherLayout({ children }) {
  return (
    <>
      <Header />
      <main style={{ minHeight: '60vh' }}>{children}</main>
      <Footer />
    </>
  );
}

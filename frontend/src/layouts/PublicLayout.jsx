import Header from '../components/Header';
import Footer from '../components/Footer';

const PublicLayout = ({ children }) => (
  <>
    <Header />
    {children}
    <Footer />
  </>
);

export default PublicLayout;
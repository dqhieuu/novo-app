import Layout from '../components/layout';
import '../styles/globals.css';
// import "../components/searchBar/searchBar.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect } from 'react';
import MangaContextProvider from '../Context/MangaContext';
import UserContextProvider from '../Context/UserContext';
import AOS from 'aos';
import 'aos/dist/aos.css'; // You can also use <link> for styles
// ..
function MyApp({ Component, pageProps }) {
  useEffect(() => {
    import('bootstrap/dist/js/bootstrap');
    AOS.init();
  }, []);
  return (
    <MangaContextProvider>
      <UserContextProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </UserContextProvider>
    </MangaContextProvider>
  );
}

export default MyApp;

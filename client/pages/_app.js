import Layout from '../components/layout/layout';
import '../styles/globals.css';
// import "../components/searchBar/searchBar.css";
import NextNProgress from 'nextjs-progressbar';
import '@yaireo/tagify/dist/tagify.css'; // Tagify CSS
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect } from 'react';
import MangaContextProvider from '../context/manga-Context';
import UserContextProvider from '../context/user-Context';
import AOS from 'aos';
import 'aos/dist/aos.css'; // You can also use <link> for styles
import ScrollButton from '../utilities/scrollButton';
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
          <ToastContainer />
          <NextNProgress />
          <Component {...pageProps} />
          <ScrollButton></ScrollButton>
        </Layout>
      </UserContextProvider>
    </MangaContextProvider>
  );
}

export default MyApp;

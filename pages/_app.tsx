import type { AppProps } from 'next/app';
import Script from 'next/script';
import { AuthProvider } from '../context/AuthContext';
import { ToastContainer } from 'react-toastify';

// Global CSS
import '../styles/index.css';
import '../styles/App.css';
import '../styles/addSlots.css';
import '../styles/table.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'react-toastify/dist/ReactToastify.css';




export default function MyApp({ Component, pageProps }: AppProps) {

      {/* nimraId :http://localhost:3000//redirect?loginid=c7bRL9M5A0GWpb1s%252Faglnw%253D%253D */}
      {/* mehmoodId :http://localhost:3000//redirect?loginid=vD%252Ff7vCnhO9FsXPXcRWY8w%253D%253D */}
      {/* admin: http://localhost:3000/redirect?loginid=TVkfU%2FMjedr8beBKkde%2B1Q%3D%3D */}
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </AuthProvider>
  );
}

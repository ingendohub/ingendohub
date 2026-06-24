// src/components/Loader.jsx
import { useEffect, useState } from 'react';
import logo from '../assets/word-logo.jpg';

const Loader = () => {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHide(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div id="loader" className={hide ? 'fade-out' : ''}>
      <div className="loader-content">
        <img src={logo} alt="Ingendohub Logo" className="loader-logo" />
        <div className="loader-spinner"></div>
      </div>
    </div>
  );
};

export default Loader;
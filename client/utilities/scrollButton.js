import React, { useState } from 'react';
import { FaArrowCircleUp } from 'react-icons/fa';
import { Button } from './Styles';

const ScrollButton = () => {
  const [visible, setVisible] = useState(false);

  const toggleVisible = () => {
    const scrolled = document.documentElement.scrollTop;
    if (scrolled > 300) {
      setVisible(true);
    } else if (scrolled <= 300) {
      setVisible(false);
    }
  };

  const scrollToTop = () => {
    typeof window !== 'undefined' &&
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
  };

  typeof window !== 'undefined' &&
    window.addEventListener('scroll', toggleVisible);

  return (
    <Button>
      <FaArrowCircleUp
        onClick={scrollToTop}
        style={{ display: visible ? 'inline' : 'none' }}
      />
    </Button>
  );
};

export default ScrollButton;

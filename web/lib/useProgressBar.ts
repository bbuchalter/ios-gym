import { useEffect } from 'react';

export function useProgressBar() {
  useEffect(() => {
    // Create progress bar element
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, #007acc, #4ec9b0);
      z-index: 1000;
      transition: width 0.3s ease;
      width: 0%;
    `;
    document.body.appendChild(progressBar);
    
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / documentHeight) * 100;
      progressBar.style.width = `${progress}%`;
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initialize
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.removeChild(progressBar);
    };
  }, []);
}


import { useEffect } from 'react';

export function useScrollAnimations() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            setTimeout(() => {
              element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
              element.style.opacity = '1';
              element.style.transform = 'translateY(0)';
            }, 100);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    // Observe all sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      observer.observe(section);
    });
    
    return () => observer.disconnect();
  }, []);
}


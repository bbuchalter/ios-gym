import { useEffect } from 'react';

export function useScrollAnimations(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    // Track which sections were already in view when observer starts
    const alreadyVisible = new Set<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;

            // Skip animation for sections that were already visible
            if (alreadyVisible.has(element)) {
              alreadyVisible.delete(element);
              return;
            }

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

    // Observe all sections and mark which are already in viewport
    const sections = document.querySelectorAll('section');
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

      if (isInViewport) {
        alreadyVisible.add(section);
      }

      observer.observe(section);
    });

    return () => observer.disconnect();
  }, [enabled]);
}

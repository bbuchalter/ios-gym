import { useEffect } from 'react';

export function useClickToCopy() {
  useEffect(() => {
    const handleClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'CODE' && target.textContent && target.textContent.length > 3) {
        const text = target.textContent;
        try {
          await navigator.clipboard.writeText(text);
          // Visual feedback
          const originalBg = target.style.backgroundColor;
          const originalColor = target.style.color;
          target.style.backgroundColor = '#22d3ee';
          target.style.color = '#0f172a';
          target.style.cursor = 'pointer';
          setTimeout(() => {
            target.style.backgroundColor = originalBg;
            target.style.color = originalColor;
          }, 200);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      }
    };
    
    // Add click handlers to all code elements
    document.addEventListener('click', handleClick);
    
    // Update cursor style
    const codeElements = document.querySelectorAll('code');
    codeElements.forEach(code => {
      if (code.textContent && code.textContent.length > 3) {
        (code as HTMLElement).style.cursor = 'pointer';
        (code as HTMLElement).title = 'Click to copy';
      }
    });
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);
}


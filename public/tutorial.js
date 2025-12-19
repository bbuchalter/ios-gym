// Tutorial Navigation and Interactivity

document.addEventListener('DOMContentLoaded', () => {
  initializeNavigation();
  initializeScrollSpy();
  initializeSmoothScroll();
  loadProgress();
});

// Navigation between sections
function initializeNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.tutorial-section');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      showSection(targetId);
      
      // Update URL hash without scrolling
      history.pushState(null, null, `#${targetId}`);
      
      // Update active nav link
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
  
  // Handle initial load with hash
  const hash = window.location.hash.substring(1);
  if (hash) {
    showSection(hash);
    navLinks.forEach(link => {
      if (link.getAttribute('href') === `#${hash}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  
  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    const hash = window.location.hash.substring(1) || 'welcome';
    showSection(hash);
  });
}

function showSection(sectionId) {
  const sections = document.querySelectorAll('.tutorial-section');
  sections.forEach(section => {
    if (section.id === sectionId) {
      section.classList.add('active');
      // Smooth scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      section.classList.remove('active');
    }
  });
}

// Smooth scroll for anchor links
function initializeSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      // Only handle internal section links
      const href = this.getAttribute('href');
      if (href.startsWith('#') && !this.classList.contains('nav-link')) {
        const targetId = href.substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
          e.preventDefault();
          
          // Show the section if it's a tutorial section
          if (targetSection.classList.contains('tutorial-section')) {
            showSection(targetId);
            history.pushState(null, null, href);
            
            // Update nav
            document.querySelectorAll('.nav-link').forEach(link => {
              if (link.getAttribute('href') === href) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          } else {
            // Scroll to element within current section
            targetSection.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      }
    });
  });
}

// Scroll spy to highlight current section
function initializeScrollSpy() {
  let ticking = false;
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveNavOnScroll();
        ticking = false;
      });
      ticking = true;
    }
  });
}

function updateActiveNavOnScroll() {
  const sections = document.querySelectorAll('.tutorial-section.active');
  if (sections.length === 0) return;
  
  const scrollPosition = window.scrollY + 200; // Offset for nav height
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    
    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      // Update URL without triggering scroll
      if (window.location.hash !== `#${sectionId}`) {
        history.replaceState(null, null, `#${sectionId}`);
      }
    }
  });
}

// Track progress (localStorage)
function loadProgress() {
  try {
    const progress = JSON.parse(localStorage.getItem('tutorialProgress') || '{}');
    
    if (progress.lastSection) {
      // Could auto-navigate to last section, but let's not be intrusive
      console.log('Welcome back! Last visited:', progress.lastSection);
    }
    
    if (progress.completedSections) {
      // Mark completed sections with a checkmark
      progress.completedSections.forEach(sectionId => {
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        if (navLink && !navLink.innerHTML.includes('✓')) {
          navLink.innerHTML += ' ✓';
        }
      });
    }
  } catch (e) {
    console.error('Failed to load progress:', e);
  }
}

function saveProgress(sectionId) {
  try {
    const progress = JSON.parse(localStorage.getItem('tutorialProgress') || '{}');
    progress.lastSection = sectionId;
    progress.lastVisit = new Date().toISOString();
    
    if (!progress.completedSections) {
      progress.completedSections = [];
    }
    
    if (!progress.completedSections.includes(sectionId)) {
      progress.completedSections.push(sectionId);
    }
    
    localStorage.setItem('tutorialProgress', JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
}

// Mark section as completed when user scrolls to bottom
let sectionCompletionTracked = new Set();

window.addEventListener('scroll', () => {
  const activeSection = document.querySelector('.tutorial-section.active');
  if (!activeSection) return;
  
  const sectionId = activeSection.id;
  if (sectionCompletionTracked.has(sectionId)) return;
  
  const scrollPosition = window.scrollY + window.innerHeight;
  const sectionBottom = activeSection.offsetTop + activeSection.offsetHeight;
  
  // If scrolled to 80% of section, mark as completed
  if (scrollPosition >= sectionBottom * 0.8) {
    sectionCompletionTracked.add(sectionId);
    saveProgress(sectionId);
  }
});

// Add copy button to code blocks
document.querySelectorAll('code').forEach(codeBlock => {
  if (codeBlock.textContent.length > 10 && !codeBlock.closest('.command-table')) {
    codeBlock.style.cursor = 'pointer';
    codeBlock.title = 'Click to copy';
    
    codeBlock.addEventListener('click', () => {
      const text = codeBlock.textContent;
      navigator.clipboard.writeText(text).then(() => {
        // Visual feedback
        const originalBg = codeBlock.style.backgroundColor;
        codeBlock.style.backgroundColor = '#4ec9b0';
        setTimeout(() => {
          codeBlock.style.backgroundColor = originalBg;
        }, 200);
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    });
  }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    // Ctrl/Cmd + Arrow keys to navigate sections
    if (e.key === 'ArrowRight') {
      navigateSection('next');
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      navigateSection('prev');
      e.preventDefault();
    }
  }
});

function navigateSection(direction) {
  const sections = ['welcome', 'getting-started', 'levels', 'concepts', 'commands', 'practice'];
  const currentHash = window.location.hash.substring(1) || 'welcome';
  const currentIndex = sections.indexOf(currentHash);
  
  let nextIndex;
  if (direction === 'next') {
    nextIndex = (currentIndex + 1) % sections.length;
  } else {
    nextIndex = (currentIndex - 1 + sections.length) % sections.length;
  }
  
  const nextSection = sections[nextIndex];
  showSection(nextSection);
  history.pushState(null, null, `#${nextSection}`);
  
  // Update nav
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === `#${nextSection}`) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Analytics (if needed in future)
function trackEvent(eventName, eventData) {
  console.log('Event:', eventName, eventData);
  // Could send to analytics service here
}

// Track which sections users visit
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    trackEvent('section_viewed', {
      section: link.getAttribute('href').substring(1)
    });
  });
});

// Track when users open the trainer
document.querySelectorAll('a[href="index.html"]').forEach(link => {
  link.addEventListener('click', () => {
    trackEvent('trainer_launched', {
      from_section: window.location.hash.substring(1) || 'welcome'
    });
  });
});

// Show a tooltip on first visit
function showWelcomeTooltip() {
  const hasVisited = localStorage.getItem('tutorialVisited');
  
  if (!hasVisited) {
    setTimeout(() => {
      const tooltip = document.createElement('div');
      tooltip.className = 'welcome-tooltip';
      tooltip.innerHTML = `
        <div style="
          position: fixed;
          top: 100px;
          right: 20px;
          background: linear-gradient(135deg, #007acc, #4ec9b0);
          color: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          max-width: 300px;
          z-index: 10000;
          animation: slideIn 0.5s ease;
        ">
          <h3 style="margin-top: 0;">👋 Welcome!</h3>
          <p style="margin-bottom: 1rem;">
            Use the navigation above to explore different topics, or click 
            "Launch Trainer" to start practicing right away!
          </p>
          <button onclick="this.parentElement.parentElement.remove()" style="
            background: white;
            color: #007acc;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
          ">Got it!</button>
        </div>
      `;
      
      // Add animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
      
      document.body.appendChild(tooltip);
      
      localStorage.setItem('tutorialVisited', 'true');
      
      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        if (tooltip.parentElement) {
          tooltip.remove();
        }
      }, 10000);
    }, 1000);
  }
}

showWelcomeTooltip();

// Print helper
function printTutorial() {
  window.print();
}

// Export progress (for teachers)
function exportProgress() {
  const progress = localStorage.getItem('tutorialProgress');
  const blob = new Blob([progress || '{}'], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tutorial-progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Make functions available globally if needed
window.tutorialHelpers = {
  printTutorial,
  exportProgress,
  showSection,
  navigateSection
};


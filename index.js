document.addEventListener("DOMContentLoaded", function () {
  // Get references to DOM elements
  const menuButton = document.getElementById('menu-button');
  const menu = document.getElementById('menu');
  const transitionOverlay = document.getElementById('transition-overlay');
  const hamburger = document.querySelector('.hamburger');
  const video = document.getElementById('background-video');

  // Toggle menu visibility on button click (if present)
  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });
  }

  // Handle hamburger click for page transition
  if (hamburger) {
    hamburger.addEventListener('click', function (e) {
      e.preventDefault();
      const targetUrl = this.getAttribute('data-target') || "examRoomNeedCalculator/calculator.html";
      
      // Add active class to trigger the transition animation
      transitionOverlay.classList.add('active');
      
      // Wait for transition to complete before navigating
      transitionOverlay.addEventListener('transitionend', function () {
        window.location.href = targetUrl;
      }, { once: true });
    });
  }

  // Handle video loading errors
  if (video) {
    video.addEventListener('error', function() {
      console.error('Video loading error');
      // Apply fallback background if video fails to load
      document.querySelector('.video-container').style.backgroundImage = "url('backvideo-poster.jpg')";
      video.style.display = 'none';
    });
  }

  // Check if device prefers reduced data
  if (window.matchMedia && window.matchMedia('(prefers-reduced-data: reduce)').matches) {
    if (video) {
      video.style.display = 'none';
      document.querySelector('.video-container').style.backgroundImage = "url('backvideo-poster.jpg')";
    }
  }

  // Resize handler for responsive elements
  function handleResize() {
    // here we could add any additional resize-specific logic here
    // e.g. dynamically adjust certain elements if needed in the future :p
  }

  // Initial call and event listener
  handleResize();
  window.addEventListener('resize', handleResize);
});
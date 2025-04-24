document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const popupMenu = document.getElementById('popup-menu');
    const popupCloseBtn = document.getElementById('popup-close-btn');
  
    // open overlay menu
    hamburgerBtn?.addEventListener('click', () => {
      popupMenu.classList.toggle('hidden');
    });
  
    // close overlay menu (when usr clicks "Close" or anywr)
    popupCloseBtn?.addEventListener('click', () => {
      popupMenu.classList.add('hidden');
    });
  
    // idea: close if user clicks outside menu content:
    // e.g., if (e.target === popupMenu) ...
  });
  
  popupMenu.addEventListener('click', (e) => {
    if (e.target === popupMenu) {
      popupMenu.classList.add('hidden');
    }
  });
  
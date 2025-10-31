/**
 * Chabad Forms - Impact Popup Module
 * Simple modular popup functionality for impact items
 */

(function() {
  'use strict';

  // Initialize global namespace
  window.ChabadForms = window.ChabadForms || {};

  // Impact popup data with lorem ipsum
  const impactData = {
    building: {
      icon: '🏠',
      title: 'Building',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.'
    },
    staff: {
      icon: '👥',
      title: 'Staff',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
    },
    utilities: {
      icon: '💡',
      title: 'Utilities',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    },
    classes: {
      icon: '📚',
      title: 'Classes',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.'
    },
    programs: {
      icon: '🎨',
      title: 'Programs',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.'
    },
    community: {
      icon: '🤝',
      title: 'Community',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.'
    }
  };

  // Show popup function
  function showImpactPopup(impactType) {
    const data = impactData[impactType];
    if (!data) return;

    const overlay = document.getElementById('impactPopupOverlay');
    const icon = document.getElementById('impactPopupIcon');
    const title = document.getElementById('impactPopupTitle');
    const text = document.getElementById('impactPopupText');

    if (!overlay || !icon || !title || !text) {
      console.error('Popup elements not found');
      return;
    }

    icon.textContent = data.icon;
    title.textContent = data.title;
    text.textContent = data.text;

    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  // Close popup function
  function closeImpactPopup() {
    const overlay = document.getElementById('impactPopupOverlay');
    if (overlay) {
      overlay.classList.remove('show');
      document.body.style.overflow = '';
    }
  }

  // Initialize impact items
  function initializeImpactPopups() {
    const impactItems = document.querySelectorAll('.impact-item[data-impact]');

    impactItems.forEach(item => {
      item.addEventListener('click', function() {
        const impactType = this.getAttribute('data-impact');
        showImpactPopup(impactType);
      });
    });

    // Close button
    const closeBtn = document.getElementById('impactPopupClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeImpactPopup);
    }

    // Close on overlay click
    const overlay = document.getElementById('impactPopupOverlay');
    if (overlay) {
      overlay.addEventListener('click', function(e) {
        if (e.target === this) {
          closeImpactPopup();
        }
      });
    }

    console.log('✅ Impact popups initialized');
  }

  // Expose public API
  window.ChabadForms.initImpactPopups = initializeImpactPopups;
  window.ChabadForms.showImpactPopup = showImpactPopup;
  window.ChabadForms.closeImpactPopup = closeImpactPopup;

  console.log('✅ Chabad Forms module loaded');

})();

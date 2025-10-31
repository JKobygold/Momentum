/**
 * Chabad Forms - Impact Section Module
 * Fully embedded impact section with HTML, CSS, and popup functionality
 */

(function() {
  'use strict';

  // Initialize global namespace
  window.ChabadForms = window.ChabadForms || {};

  // Inject CSS styles
  function injectStyles() {
    const styleId = 'chabad-impact-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .impact-section-wrapper {
        margin-top: 30px;
        padding: 25px 20px;
        background: #f5f5f5;
        border: none;
        border-radius: 12px;
        box-shadow: none;
      }

      .impact-heading {
        text-align: center;
        font-size: 20px;
        font-weight: 600;
        color: #2c2416;
        margin-top: 0;
        margin-bottom: 10px;
        letter-spacing: 2px;
        text-transform: uppercase;
      }

      .impact-subheading {
        text-align: center;
        font-size: 16px;
        color: #2c2416;
        margin-bottom: 25px;
        line-height: 1.6;
        font-style: italic;
        padding: 0 15px;
        font-weight: 500;
      }

      .impact-icons {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-top: 15px;
        padding: 0 10px;
        max-width: 800px;
        margin-left: auto;
        margin-right: auto;
      }

      .impact-footer {
        text-align: center;
        font-size: 14px;
        color: #2c2416;
        margin-top: 25px;
        padding: 18px 20px;
        background: rgba(255, 255, 255, 0.5);
        border: 1px solid #d4af37;
        border-radius: 8px;
        line-height: 1.6;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      }

      .impact-footer strong {
        color: #d4af37;
        font-weight: 700;
      }

      .impact-item {
        text-align: center;
        padding: 20px 15px;
        background: white;
        border: 2px solid #d4af37;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .impact-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(212, 175, 55, 0.3);
      }

      .impact-icon {
        font-size: 36px;
        margin-bottom: 8px;
        display: block;
      }

      .impact-label {
        font-size: 13px;
        color: #2c2416;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      /* Mobile responsive */
      @media (max-width: 600px) {
        .impact-icons {
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 12px !important;
          padding: 0 5px !important;
        }

        .impact-item {
          padding: 15px 8px !important;
          min-height: 100px !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          align-items: center !important;
        }

        .impact-icon {
          font-size: 28px !important;
          margin-bottom: 5px !important;
        }

        .impact-label {
          font-size: 11px !important;
          line-height: 1.2 !important;
        }
      }

      /* Popup overlay styles */
      .impact-popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(44, 36, 22, 0.85);
        backdrop-filter: blur(6px);
        z-index: 1000002;
        display: none;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .impact-popup-overlay.show {
        display: flex;
        opacity: 1;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }

      .impact-popup {
        background: #fff;
        border: 3px solid #d4af37;
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(212, 175, 55, 0.5);
        position: relative;
        transform: scale(0.9);
        transition: transform 0.3s ease;
        overflow: hidden;
      }

      .impact-popup-overlay.show .impact-popup {
        transform: scale(1);
      }

      .impact-popup-header {
        background: linear-gradient(135deg, #fff9e6, #f5f0d6);
        padding: 30px 60px 30px 30px;
        border-bottom: 2px solid #d4af37;
        text-align: center;
        position: relative;
      }

      .impact-popup-icon {
        font-size: 48px;
        margin-bottom: 10px;
      }

      .impact-popup-title {
        font-size: 28px;
        font-weight: 700;
        color: #2c2416;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .impact-popup-close {
        position: absolute;
        top: 15px;
        right: 15px;
        background: transparent;
        border: none;
        font-size: 32px;
        color: #5d4e37;
        cursor: pointer;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s;
        z-index: 10;
      }

      .impact-popup-close:hover {
        background: rgba(212, 175, 55, 0.2);
        color: #2c2416;
        transform: rotate(90deg);
      }

      .impact-popup-body {
        padding: 30px;
        text-align: left;
      }

      .impact-popup-text {
        font-size: 16px;
        color: #2c2416;
        line-height: 1.8;
        margin-bottom: 20px;
      }
    `;
    document.head.appendChild(style);
  }

  // Impact popup data
  const impactData = {
    building: {
      icon: '🏠',
      title: 'Building',
      text: 'Your support helps maintain our physical space - a welcoming home where community members gather, celebrate, and find connection. From structural maintenance to creating warm, inviting spaces, your contribution ensures our doors remain open to all.'
    },
    staff: {
      icon: '👥',
      title: 'Staff',
      text: 'Behind every program and service are dedicated individuals who bring our mission to life. Your monthly gift helps us attract and retain passionate staff members who create meaningful experiences and provide personal support to our community.'
    },
    utilities: {
      icon: '💡',
      title: 'Utilities',
      text: 'From keeping the lights on to maintaining a comfortable environment, your support covers the essential services that make our space functional and welcoming year-round, ensuring we can serve our community in comfort and safety.'
    },
    classes: {
      icon: '📚',
      title: 'Classes',
      text: 'Education is at the heart of our mission. Your contribution supports engaging classes and study programs that enrich minds, deepen understanding, and foster lifelong learning for community members of all ages and backgrounds.'
    },
    programs: {
      icon: '🎨',
      title: 'Programs',
      text: 'From holiday celebrations to social gatherings, from youth activities to cultural events - your support brings our community together through meaningful programs that create joy, connection, and lasting memories.'
    },
    community: {
      icon: '🤝',
      title: 'Community',
      text: 'At the core of everything we do is community - people caring for one another. Your monthly support helps us provide meals, assistance to those in need, and the countless acts of kindness that make our community a true family.'
    }
  };

  // Show popup
  function showImpactPopup(impactType) {
    const data = impactData[impactType];
    if (!data) return;

    const overlay = document.getElementById('impactPopupOverlay');
    const icon = document.getElementById('impactPopupIcon');
    const title = document.getElementById('impactPopupTitle');
    const text = document.getElementById('impactPopupText');

    if (!overlay || !icon || !title || !text) return;

    icon.textContent = data.icon;
    title.textContent = data.title;
    text.textContent = data.text;

    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  // Close popup
  function closeImpactPopup() {
    const overlay = document.getElementById('impactPopupOverlay');
    if (!overlay) return;

    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  // Inject HTML
  function injectHTML(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Impact container not found:', containerId);
      return;
    }

    container.innerHTML = `
      <div class="impact-section-wrapper">
        <h3 class="impact-heading">Where Your Support Goes</h3>
        <p class="impact-subheading">By becoming a monthly donor, you're not just giving — you're partnering. You're helping keep the lights on, the doors open, and the warmth flowing for everyone who walks in.</p>

        <div class="impact-icons">
          <div class="impact-item" data-impact="building">
            <span class="impact-icon">🏠</span>
            <div class="impact-label">Building</div>
          </div>
          <div class="impact-item" data-impact="staff">
            <span class="impact-icon">👥</span>
            <div class="impact-label">Staff</div>
          </div>
          <div class="impact-item" data-impact="utilities">
            <span class="impact-icon">💡</span>
            <div class="impact-label">Utilities</div>
          </div>
          <div class="impact-item" data-impact="classes">
            <span class="impact-icon">📚</span>
            <div class="impact-label">Classes</div>
          </div>
          <div class="impact-item" data-impact="programs">
            <span class="impact-icon">🎨</span>
            <div class="impact-label">Programs</div>
          </div>
          <div class="impact-item" data-impact="community">
            <span class="impact-icon">🤝</span>
            <div class="impact-label">Community</div>
          </div>
        </div>
      </div>

      <!-- Popup overlay -->
      <div class="impact-popup-overlay" id="impactPopupOverlay">
        <div class="impact-popup">
          <div class="impact-popup-header">
            <button class="impact-popup-close" id="impactPopupClose">&times;</button>
            <div class="impact-popup-icon" id="impactPopupIcon"></div>
            <h3 class="impact-popup-title" id="impactPopupTitle"></h3>
          </div>
          <div class="impact-popup-body">
            <p class="impact-popup-text" id="impactPopupText"></p>
          </div>
        </div>
      </div>
    `;
  }

  // Initialize click handlers
  function initializeClickHandlers() {
    const impactItems = document.querySelectorAll('.impact-item[data-impact]');

    impactItems.forEach(item => {
      item.addEventListener('click', function() {
        const impactType = this.getAttribute('data-impact');
        showImpactPopup(impactType);
      });
    });

    const closeBtn = document.getElementById('impactPopupClose');
    const overlay = document.getElementById('impactPopupOverlay');

    if (closeBtn) {
      closeBtn.addEventListener('click', closeImpactPopup);
    }

    if (overlay) {
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
          closeImpactPopup();
        }
      });
    }

    console.log('✅ Impact popups initialized');
  }

  // Main initialization
  function init(containerId = 'chabad-impact-container') {
    injectStyles();
    injectHTML(containerId);
    initializeClickHandlers();
    console.log('✅ Chabad Impact Section loaded');
  }

  // Expose public API
  window.ChabadForms.initImpact = init;
  window.ChabadForms.showImpactPopup = showImpactPopup;
  window.ChabadForms.closeImpactPopup = closeImpactPopup;

  console.log('✅ Chabad Forms Impact Module ready');

})();

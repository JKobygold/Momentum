/**
 * Chabad Forms - External JavaScript Library
 * This file contains all the form logic extracted from momentum.html
 * Host this on a CDN or static file server for better performance
 *
 * EXACT COPY from momentum.html lines 2992-4213
 */

(function() {
  'use strict';

  // ============================================================================
  // ALL CODE BELOW IS EXACT COPY FROM MOMENTUM.HTML LINES 2992-4213
  // ============================================================================

    
    let currentSelection = {
      amount: 180,
      title: 'Gold Benefactor',
      subtitle: 'Founding Partner',
      description: 'Lead our transformation with premium recognition',
      type: 'monthly',
      isCustom: false
    };

    // Progress bar animation configuration
    const PROGRESS_CONFIG = {
      currentMembers: 19,  // Update this number as recurring memberships grow
      goalMembers: 175,
      animationDuration: 2000 // 2 seconds
    };

    function animateProgress() {
      const currentCountEl = document.getElementById('currentCount');
      const progressBarEl = document.getElementById('progressBar');
      const progressPercentageEl = document.getElementById('progressPercentage');

      if (!currentCountEl || !progressBarEl || !progressPercentageEl) return;

      const targetCount = PROGRESS_CONFIG.currentMembers;
      const targetPercentage = (targetCount / PROGRESS_CONFIG.goalMembers) * 100;
      const duration = PROGRESS_CONFIG.animationDuration;
      const fps = 60;
      const totalFrames = (duration / 1000) * fps;
      const incrementPerFrame = targetCount / totalFrames;

      let currentFrame = 0;
      let currentValue = 0;

      const animationInterval = setInterval(() => {
        currentFrame++;
        currentValue = Math.min(currentFrame * incrementPerFrame, targetCount);

        // Update counter with easing
        const displayValue = Math.floor(currentValue);
        currentCountEl.textContent = displayValue;

        // Update progress bar
        const currentPercentage = (currentValue / PROGRESS_CONFIG.goalMembers) * 100;
        progressBarEl.style.width = currentPercentage + '%';
        progressPercentageEl.textContent = currentPercentage.toFixed(1) + '%';

        if (currentFrame >= totalFrames) {
          clearInterval(animationInterval);
          currentCountEl.textContent = targetCount;
          progressBarEl.style.width = targetPercentage + '%';
          progressPercentageEl.textContent = targetPercentage.toFixed(1) + '%';
        }
      }, 1000 / fps);
    }

    function initializeProgressBar() {
      // Use Intersection Observer to trigger animation when section is visible
      const progressSection = document.querySelector('.progress-section');
      if (!progressSection) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateProgress();
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      observer.observe(progressSection);
    }

    // Loading overlay functions
    function showLoading() {
      const loadingOverlay = document.getElementById('loadingOverlay');
      if (loadingOverlay) {
        loadingOverlay.classList.add('show');
        document.body.style.overflow = 'hidden';
      }
    }

    function hideLoading() {
      const loadingOverlay = document.getElementById('loadingOverlay');
      if (loadingOverlay) {
        loadingOverlay.classList.remove('show');
        document.body.style.overflow = '';
      }
    }

    // Show thank you overlay with donor information
    function showThankYou() {
      // Hide loading overlay first
      hideLoading();

      const donationData = sessionStorage.getItem('bala_donation');

      if (!donationData) {
        console.log('No donation data found in sessionStorage');
        return;
      }

      const donor = JSON.parse(donationData);
      console.log('Showing thank you page with donor data:', donor);

      // Update donor name
      const fullName = `${donor.firstName} ${donor.lastName}`;
      document.getElementById('thankYouDonorName').textContent = fullName;
      document.getElementById('thankYouPlaqueName').textContent = fullName;

      // Update tier badge
      document.getElementById('thankYouTierBadge').textContent = `${donor.tier} - ${donor.subtitle}`;

      // Update donation details
      const frequency = donor.type === 'monthly' ? '/month' : '';
      document.getElementById('thankYouDetailAmount').textContent = `$${donor.amount}${frequency}`;
      document.getElementById('thankYouDetailTier').textContent = `${donor.tier} - ${donor.subtitle}`;

      // Update dedication if exists
      if (donor.dedication) {
        document.getElementById('thankYouDedicationRow').style.display = 'flex';
        document.getElementById('thankYouDetailDedication').textContent = donor.dedication;
        document.getElementById('thankYouPlaqueDedication').textContent = donor.dedication;
      }

      // Determine plaque class based on tier AND show/hide wall preview
      const wallPreview = document.querySelector('.wall-preview');
      const previewPlaque = document.getElementById('thankYouPreviewPlaque');
      const tierLower = donor.tier.toLowerCase();

      // Define minimum amount for Wall of Gratitude recognition
      // Typically Bronze tier ($36/month) is the minimum
      const MINIMUM_WALL_AMOUNT = 36;
      const qualifiesForWall = donor.amount >= MINIMUM_WALL_AMOUNT;

      if (qualifiesForWall && wallPreview) {
        // Show wall preview
        wallPreview.style.display = 'block';

        // Remove any existing tier classes
        previewPlaque.classList.remove('diamond', 'gold', 'silver', 'bronze');

        if (tierLower.includes('diamond')) {
          previewPlaque.classList.add('diamond');
        } else if (tierLower.includes('gold')) {
          previewPlaque.classList.add('gold');
        } else if (tierLower.includes('silver')) {
          previewPlaque.classList.add('silver');
        } else if (tierLower.includes('bronze')) {
          previewPlaque.classList.add('bronze');
        }
      } else if (wallPreview) {
        // Hide wall preview for donations below minimum
        wallPreview.style.display = 'none';
        console.log(`ℹ Donation amount $${donor.amount} is below minimum $${MINIMUM_WALL_AMOUNT} for Wall of Gratitude`);
      }

      // Display receipt if available
      if (donor.receiptHTML && donor.receiptHTML.trim()) {
        console.log('✓ Receipt found, displaying in thank you overlay');
        const receiptSection = document.getElementById('thankYouReceipt');
        const receiptContent = document.getElementById('thankYouReceiptContent');

        if (receiptSection && receiptContent) {
          // CLEAN THE RECEIPT HTML - Remove navbar and extra page elements
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = donor.receiptHTML;

          // Remove navigation, header, footer, and other page chrome
          const elementsToRemove = [
            'nav', 'header', 'footer',
            '.site-header', '.site-footer',
            '#header', '#footer',
            '.topbar', '.nav', '.navbar',
            '.breadcrumbs', '.banner',
            '#co_banner_container', '#co_header_container',
            '.chabad_header', '#co_global_header',
            'script', 'style', 'link' // Remove scripts and styles
          ];

          elementsToRemove.forEach(selector => {
            tempDiv.querySelectorAll(selector).forEach(el => el.remove());
          });

          // Try to find the actual receipt/confirmation content
          // Look for common JotForm/Chabad receipt containers
          const receiptContainer = tempDiv.querySelector('.form-all') ||
                                  tempDiv.querySelector('.content') ||
                                  tempDiv.querySelector('#ContentBody') ||
                                  tempDiv.querySelector('[role="main"]') ||
                                  tempDiv.querySelector('main') ||
                                  tempDiv;

          // Extract only the cleaned content
          const cleanedHTML = receiptContainer.innerHTML || tempDiv.innerHTML;
          receiptContent.innerHTML = cleanedHTML;
          receiptSection.style.display = 'block';

          console.log('✓ Receipt HTML cleaned and displayed');

          // Style any JotForm elements inside the receipt
          receiptContent.querySelectorAll('*').forEach(el => {
            // Remove any inline styles that might conflict
            el.style.fontFamily = 'inherit';
            // Make sure text is readable
            if (el.style.color === 'white' || el.style.color === '#fff') {
              el.style.color = '#2c2416';
            }
          });
        }
      } else {
        console.log('ℹ No receipt HTML found');
      }

      // Show the overlay with animation
      const overlay = document.getElementById('thankYouOverlay');
      overlay.style.display = 'block';
      setTimeout(() => {
        overlay.classList.add('show');
      }, 10);

      // TODO: Add donor to the donor wall automatically
      // This would involve adding a new plaque element to the appropriate tier section
      // addDonorToWall(donor);

      // Optionally clear sessionStorage after displaying
      // sessionStorage.removeItem('bala_donation');
    }

    // Impact popups disabled - causing site crashes
    function setupImpactPopups() {
      // Functionality disabled to prevent database errors
      return;
    }

    function initializeBalaForm() {
      // Auto-scroll to top of page on mobile
      if (window.innerWidth <= 768) {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);
      }

      // OPTIMIZATION: Event delegation for tier cards instead of multiple listeners
      const tierContainer = document.querySelector('.membership-tiers');
      if (tierContainer) {
        tierContainer.addEventListener('click', function(e) {
          const card = e.target.closest('.tier-card');
          if (card) {
            handleTierSelection(card);
          }
        });
      }
    
      // Form handlers
      const customAmount = document.getElementById('newCustomAmount');
      if (customAmount) {
        customAmount.addEventListener('input', function() {
          if (currentSelection.isCustom && this.value >= 1) {
            currentSelection.amount = parseInt(this.value);
            updateModalDisplay();
          }
        });
      }
    
      const cardButton = document.getElementById('newCardButton');
      if (cardButton) {
        cardButton.addEventListener('click', handleFormSubmission);
      }
    
      const dedicationType = document.getElementById('newDedicationType');
      if (dedicationType) {
        dedicationType.addEventListener('change', updateDedicationField);
      }
    
      // Card number formatting
      const cardNumber = document.getElementById('newCardNumber');
      if (cardNumber) {
        cardNumber.addEventListener('input', function() {
          this.value = this.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
        });
      }
    
      setupFieldSync();

      // Initialize progress bar animation
      initializeProgressBar();

      // Impact item click handlers
      setupImpactPopups();

      // YouTube unmute button handler
      const unmuteBtn = document.getElementById('unmuteBtn');
      if (unmuteBtn) {
        let isMuted = true;

        unmuteBtn.addEventListener('click', function() {
          const iframe = document.getElementById('balaVideo');
          if (!iframe) return;

          if (isMuted) {
            // Unmute and hide button with fade out animation
            const currentSrc = iframe.src;
            iframe.src = currentSrc.replace('mute=1', 'mute=0');
            isMuted = false;

            // Fade out and hide the button
            this.style.opacity = '0';
            this.style.pointerEvents = 'none';
            setTimeout(() => {
              this.style.display = 'none';
            }, 300);
          }
        });

        // Hover effect
        unmuteBtn.addEventListener('mouseenter', function() {
          this.style.background = 'rgba(0, 0, 0, 0.7)';
        });
        unmuteBtn.addEventListener('mouseleave', function() {
          this.style.background = 'rgba(0, 0, 0, 0.5)';
        });

        // Auto-mute when scrolling away from video (and show button again)
        const videoContainer = document.getElementById('balaVideo')?.parentElement;
        if (videoContainer) {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              // If video is less than 50% visible and currently unmuted, auto-mute and show button
              if (entry.intersectionRatio < 0.5 && !isMuted) {
                const iframe = document.getElementById('balaVideo');
                if (iframe) {
                  const currentSrc = iframe.src;
                  iframe.src = currentSrc.replace('mute=0', 'mute=1');
                  isMuted = true;

                  // Show button again with fade in
                  unmuteBtn.style.display = 'flex';
                  unmuteBtn.style.pointerEvents = 'auto';
                  setTimeout(() => {
                    unmuteBtn.style.opacity = '1';
                  }, 10);
                }
              }
            });
          }, { threshold: [0.5] });

          observer.observe(videoContainer);
        }
      }

      // Add dollar button handler
      const addDollarBtn = document.getElementById('addDollarBtn');
      if (addDollarBtn) {
        addDollarBtn.addEventListener('click', function() {
          const customAmountInput = document.getElementById('newCustomAmount');
          if (customAmountInput) {
            const currentValue = parseInt(customAmountInput.value) || 0;
            customAmountInput.value = currentValue + 1;
            // Trigger input event to update selection
            customAmountInput.dispatchEvent(new Event('input'));
          }
        });

        // Add hover effect
        addDollarBtn.addEventListener('mouseenter', function() {
          this.style.background = '#b8941f';
        });
        addDollarBtn.addEventListener('mouseleave', function() {
          this.style.background = '#d4af37';
        });
      }

      // MODAL CONTROLS
      const modalClose = document.getElementById('modalClose');
      const modalOverlay = document.getElementById('modalOverlay');

      if (modalClose) {
        modalClose.addEventListener('click', closeModal);
      }

      if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
      }

      // MULTI-STEP FORM NAVIGATION
      const nextToPaymentBtn = document.getElementById('nextToPaymentBtn');
      const backToPersonalBtn = document.getElementById('backToPersonalBtn');

      if (nextToPaymentBtn) {
        nextToPaymentBtn.addEventListener('click', function() {
          // Validate personal information before proceeding
          const requiredFields = [
            'newFirstName', 'newLastName', 'newEmail', 'newAddress',
            'newCity', 'newState', 'newZipCode', 'newPhone'
          ];

          let allValid = true;
          for (const fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
              allValid = false;
              if (field) field.focus();
              alert('Please fill in all required personal information fields.');
              break;
            }
          }

          // Validate custom amount if applicable
          if (currentSelection.isCustom) {
            const customAmount = document.getElementById('newCustomAmount');
            if (!customAmount.value || customAmount.value < 1) {
              alert('Please enter a donation amount of at least $1.');
              customAmount.focus();
              return;
            }
            currentSelection.amount = parseInt(customAmount.value);
          }

          if (allValid) {
            // Switch to payment tab
            document.getElementById('tab-personal').classList.remove('active');
            document.getElementById('tab-payment').classList.add('active');

            // Scroll to top of modal
            document.querySelector('.donation-modal').scrollTop = 0;
          }
        });
      }

      if (backToPersonalBtn) {
        backToPersonalBtn.addEventListener('click', function() {
          // Switch back to personal tab
          document.getElementById('tab-payment').classList.remove('active');
          document.getElementById('tab-personal').classList.add('active');

          // Scroll to top of modal
          document.querySelector('.donation-modal').scrollTop = 0;
        });
      }

      // TAB SWITCHING (kept for backward compatibility, but tabs are hidden)
      document.querySelectorAll('.modal-tab').forEach(tab => {
        tab.addEventListener('click', function() {
          const targetTab = this.dataset.tab;

          // Remove active from all tabs and content
          document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

          // Add active to clicked tab and its content
          this.classList.add('active');
          document.getElementById('tab-' + targetTab).classList.add('active');
        });
      });

      // ESC key to close modal
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          closeModal();
        }
      });

      // Check if we should show thank you overlay (e.g., after page redirect from successful donation)
      // Look for donation data in sessionStorage AND check if we're on a thank you page or have success indicators
      setTimeout(() => {
        const donationData = sessionStorage.getItem('bala_donation');
        if (donationData) {
          // Check for JotForm thank you elements
          const thankYouElements = [
            document.querySelector('.form-all-thankyou'),
            document.querySelector('.thankyou-message'),
            document.querySelector('[data-type="control_text"]')
          ];

          const hasThankYouElement = thankYouElements.some(el => el && el.offsetParent !== null);

          // If we have donation data and a thank you element is visible, show our thank you overlay
          if (hasThankYouElement) {
            console.log('✓ Detected successful donation - showing thank you overlay');
            showThankYou();
          }
        }
      }, 1500); // Wait for page to fully load
    }

    function handleTierSelection(clickedCard) {
      // Check if this is a redirect card
      if (clickedCard.dataset.redirect === 'true') {
        const url = clickedCard.dataset.url;
        if (url) {
          window.location.href = url;
        }
        return;
      }

      // Lock scroll position IMMEDIATELY before any other operations
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      document.querySelectorAll('.tier-card').forEach(card => {
        card.classList.remove('selected');
      });

      clickedCard.classList.add('selected');

      const amount = clickedCard.dataset.amount;
      const title = clickedCard.dataset.title;
      const subtitle = clickedCard.dataset.subtitle;
      const type = clickedCard.dataset.type;

      if (amount === 'custom' || amount === 'custom-onetime') {
        currentSelection = {
          amount: 0,
          title: title,
          subtitle: subtitle,
          description: clickedCard.querySelector('.tier-description').textContent,
          type: type,
          isCustom: true
        };
        document.getElementById('newCustomAmountField').style.display = 'block';
      } else {
        currentSelection = {
          amount: parseInt(amount),
          title: title,
          subtitle: subtitle,
          description: clickedCard.querySelector('.tier-description').textContent,
          type: type,
          isCustom: false
        };
        document.getElementById('newCustomAmountField').style.display = 'none';
      }

      updateModalDisplay();
      openModal();
    }

    function openModal() {
      const overlay = document.getElementById('modalOverlay');
      const modal = document.getElementById('donationModal');

      overlay.classList.add('show');
      modal.classList.add('show');

      // Scroll modal to top
      if (modal) {
        modal.scrollTop = 0;
      }
    }

    function closeModal() {
      const overlay = document.getElementById('modalOverlay');
      const modal = document.getElementById('donationModal');

      overlay.classList.remove('show');
      modal.classList.remove('show');

      // Restore page scrolling and position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    function updateModalDisplay() {
      const frequency = currentSelection.type === 'monthly' ? '/month' : '';
      document.getElementById('modalAmount').textContent = `$${currentSelection.amount}${frequency}`;
      document.getElementById('modalTier').textContent = `${currentSelection.title} - ${currentSelection.subtitle}`;
      document.getElementById('modalDescription').textContent = currentSelection.description;
    }
    
    function updateDisplay() {
      const frequency = currentSelection.type === 'monthly' ? '/month' : '';
      document.getElementById('selectedAmount').textContent = `$${currentSelection.amount}${frequency}`;
      document.getElementById('selectedTier').textContent = `${currentSelection.title} - ${currentSelection.subtitle}`;
      document.getElementById('selectedDescription').textContent = currentSelection.description;
    }
    
    function updateDedicationField() {
      const dedicationType = document.getElementById('newDedicationType').value;
      const nameField = document.getElementById('newDedicationNameField');
      const messageField = document.getElementById('newDedicationMessageField');
      const label = document.getElementById('newDedicationLabel');
      
      nameField.style.display = 'none';
      messageField.style.display = 'none';
      
      if (dedicationType === 'honor') {
        nameField.style.display = 'block';
        label.textContent = 'In honor of (name)';
      } else if (dedicationType === 'memory') {
        nameField.style.display = 'block';
        label.textContent = 'In memory of (name)';
      } else if (dedicationType === 'celebration') {
        nameField.style.display = 'block';
        label.textContent = 'In celebration of (name/event)';
      } else if (dedicationType === 'custom') {
        messageField.style.display = 'block';
      }
    }
    
    function setupFieldSync() {
      // This will sync with any hidden Chabad form fields that exist
      const mappings = [
        { new: 'newFirstName', chabad: 'first_3' },
        { new: 'newLastName', chabad: 'last_3' },
        { new: 'newEmail', chabad: 'input_4' },
        { new: 'newAddress', chabad: 'input_10_addr_line1' },
        { new: 'newCity', chabad: 'input_10_city' },
        { new: 'newState', chabad: 'input_10_state' },
        { new: 'newZipCode', chabad: 'input_10_postal' },
        { new: 'newCardNumber', chabad: 'input_7_cc_number' },
        { new: 'newCvv', chabad: 'input_7_cc_ccv' },
        { new: 'newNameOnCard', chabad: 'input_7_cc_nameOnCard' },
        { new: 'newExpiryMonth', chabad: 'input_7_cc_exp_month' },
        { new: 'newExpiryYear', chabad: 'input_7_cc_exp_year' }
      ];
    
      mappings.forEach(mapping => {
        const newField = document.getElementById(mapping.new);
        if (newField) {
          newField.addEventListener('input', function() {
            const chabadField = document.getElementById(mapping.chabad);
            if (chabadField) {
              if (mapping.new === 'newCardNumber') {
                chabadField.value = this.value.replace(/\s/g, '');
              } else {
                chabadField.value = this.value;
              }
            }
          });
        }
      });
    
      // Phone field special handling
      const phoneField = document.getElementById('newPhone');
      if (phoneField) {
        phoneField.addEventListener('input', function() {
          const phone = this.value.replace(/\D/g, '');
          if (phone.length >= 10) {
            const areaCode = phone.substring(0, 3);
            const number = phone.substring(3);
            
            const chabadArea = document.getElementById('input_6_area');
            const chabadPhone = document.getElementById('input_6_phone');
            
            if (chabadArea) chabadArea.value = areaCode;
            if (chabadPhone) chabadPhone.value = number;
          }
        });
      }
    }
    
    function validateForm() {
      const required = ['newFirstName', 'newLastName', 'newEmail', 'newAddress', 'newCity', 'newState', 'newZipCode', 'newPhone', 'newCardNumber', 'newCvv', 'newNameOnCard', 'newExpiryMonth', 'newExpiryYear'];
      
      for (let field of required) {
        const element = document.getElementById(field);
        if (!element || !element.value.trim()) {
          alert(`Please fill in the ${field.replace('new', '').replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
          return false;
        }
      }
      
      if (currentSelection.isCustom) {
        const customAmount = document.getElementById('newCustomAmount');
        if (!customAmount.value || customAmount.value < 1) {
          alert('Please enter a donation amount of at least $1.');
          return false;
        }
        currentSelection.amount = parseInt(customAmount.value);
      }

      if (!currentSelection.amount || currentSelection.amount < 1) {
        alert('Please select a donation amount.');
        return false;
      }
      
      return true;
    }
    
    // Wait for the Chabad.org form to be generated (might be in iframe!)
    function waitForChabadForm(maxAttempts = 20) {
      return new Promise((resolve) => {
        let attempts = 0;

        const checkForm = () => {
          attempts++;
          console.log(`⏳ Attempt ${attempts}/${maxAttempts} - Looking for Chabad.org form...`);

          // First check main page for forms
          const allForms = document.querySelectorAll('form');
          let foundForm = null;

          allForms.forEach((form) => {
            const isSearchForm = form.id === 'MainSearchForm' || form.name === 'MainSearchForm';
            const isInsideModal = form.closest('#bala-replacement');
            const hasQ3Field = form.querySelector('[name="q3_fullName3[first]"]');

            if (!isSearchForm && !isInsideModal && hasQ3Field && !foundForm) {
              foundForm = form;
            }
          });

          // If not found on main page, check iframes
          if (!foundForm) {
            const iframes = document.querySelectorAll('iframe');
            console.log(`🖼️  Checking ${iframes.length} iframe(s)...`);

            iframes.forEach((iframe, idx) => {
              try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (iframeDoc) {
                  const iframeForms = iframeDoc.querySelectorAll('form');
                  console.log(`  iframe[${idx}]: ${iframeForms.length} form(s)`);

                  iframeForms.forEach((form) => {
                    const hasQ3Field = form.querySelector('[name="q3_fullName3[first]"]');
                    if (hasQ3Field && !foundForm) {
                      console.log('✅ Found form inside iframe!');
                      foundForm = form;
                    }
                  });
                }
              } catch (err) {
                console.log(`  iframe[${idx}]: Cannot access (cross-origin)`, err.message);
              }
            });
          }

          if (foundForm) {
            console.log('✅ Chabad.org form found!');
            resolve(foundForm);
          } else if (attempts >= maxAttempts) {
            console.log('❌ Chabad.org form not found after', maxAttempts, 'attempts');
            resolve(null);
          } else {
            setTimeout(checkForm, 250); // Check every 250ms
          }
        };

        checkForm();
      });
    }

    async function handleFormSubmission(e) {
      if (e) e.preventDefault();

      if (!validateForm()) return;

      // Close modal and show loading overlay immediately
      closeModal();
      showLoading();

      // TEST MODE: Log all form data to console
      console.log('=== FORM SUBMISSION TEST ===');
      console.log('Selection:', currentSelection);
      console.log('Form Data:', {
        firstName: document.getElementById('newFirstName').value,
        lastName: document.getElementById('newLastName').value,
        email: document.getElementById('newEmail').value,
        address: document.getElementById('newAddress').value,
        city: document.getElementById('newCity').value,
        state: document.getElementById('newState').value,
        zip: document.getElementById('newZipCode').value,
        phone: document.getElementById('newPhone').value,
        cardNumber: document.getElementById('newCardNumber').value.replace(/\s/g, '').replace(/\d(?=\d{4})/g, '*'),
        expiryMonth: document.getElementById('newExpiryMonth').value,
        expiryYear: document.getElementById('newExpiryYear').value,
        dedication: getDedicationText()
      });

      // Wait for the Chabad.org form to exist
      console.log('🔍 Waiting for Chabad.org form to load...');
      const chabadForm = await waitForChabadForm();

      if (!chabadForm) {
        console.log('📋 Total forms found:', document.querySelectorAll('form').length);
        document.querySelectorAll('form').forEach((form, i) => {
          console.log(`Form ${i}:`, {
            id: form.id,
            name: form.name,
            hasQ3: !!form.querySelector('[name="q3_fullName3[first]"]')
          });
        });
      }

      if (chabadForm) {
        console.log('✓ Chabad.org form found! Syncing fields and submitting...');

        // Fill in all the Chabad.org form fields with data from the modal
        syncAllFieldsToJotForm(chabadForm);

        // Set payment method to credit card (try multiple selectors)
        const creditCardRadio = document.querySelector('input[value="Credit Card"]') ||
                               document.querySelector('input[name="q7_payment[method]"]') ||
                               document.getElementById('input_7_creditCard') ||
                               document.querySelector('input[type="radio"][id*="credit"]');
        if (creditCardRadio) {
          creditCardRadio.checked = true;
          creditCardRadio.click(); // Trigger change event
          creditCardRadio.dispatchEvent(new Event('change', { bubbles: true }));
          console.log('✓ Payment method set to Credit Card');
        } else {
          console.log('ℹ Payment method radio not found (form may auto-detect from card fields)');
        }

        // Set recurring if monthly
        if (currentSelection.type === 'monthly') {
          const recurringCheckbox = document.getElementById('input_14');
          if (recurringCheckbox) {
            recurringCheckbox.checked = true;
            recurringCheckbox.click(); // Trigger any change handlers
            console.log('✓ Recurring payment enabled');
          }
        } else {
          const recurringCheckbox = document.getElementById('input_14');
          if (recurringCheckbox) {
            recurringCheckbox.checked = false;
            console.log('✓ One-time payment');
          }
        }

        // Set dedication
        const dedicationField = document.getElementById('input_13');
        if (dedicationField) {
          dedicationField.value = getDedicationText();
          console.log('✓ Dedication set');
        }

        // Log all form fields to debug
        console.log('=== CHABAD FORM FIELD VALUES ===');
        const debugFields = ['first_3', 'last_3', 'input_4', 'input_10_addr_line1', 'input_10_city', 'input_10_state', 'input_10_postal', 'input_6_area', 'input_6_phone', 'input_7_cc_number', 'input_7_cc_exp_month', 'input_7_cc_exp_year', 'input_7_cc_ccv', 'input_7_cc_nameOnCard'];
        debugFields.forEach(fieldId => {
          const field = document.getElementById(fieldId);
          console.log(`${fieldId}:`, field ? field.value : 'NOT FOUND');
        });

        // Wait a moment for all fields to settle
        setTimeout(() => {
          // Store donor info for thank you page
          const donorInfo = {
            firstName: document.getElementById('newFirstName').value,
            lastName: document.getElementById('newLastName').value,
            amount: currentSelection.amount,
            tier: currentSelection.title,
            subtitle: currentSelection.subtitle,
            type: currentSelection.type,
            dedication: getDedicationText()
          };

          // Save to sessionStorage for thank you page
          sessionStorage.setItem('bala_donation', JSON.stringify(donorInfo));

          // Find and click the submit button
          const submitBtn = chabadForm.querySelector('button[type="submit"]') ||
                           chabadForm.querySelector('input[type="submit"]') ||
                           chabadForm.querySelector('.form-submit-button');

          if (submitBtn) {
            console.log('✓ Submit button found, setting up receipt capture...');

            // STRATEGY: Submit form in hidden iframe to capture redirect URL
            // The form will redirect to: /Templates/ArticleCcoResponse_cdo/aid/7034618/submissionid/[ID]/embed/

            // Change form target to submit in a hidden iframe
            const receiptIframe = document.createElement('iframe');
            receiptIframe.name = 'receipt-capture-frame';
            receiptIframe.style.position = 'fixed';
            receiptIframe.style.top = '-9999px';
            receiptIframe.style.left = '-9999px';
            receiptIframe.style.width = '1px';
            receiptIframe.style.height = '1px';
            receiptIframe.style.opacity = '0';
            document.body.appendChild(receiptIframe);

            // Set form to submit to iframe
            chabadForm.setAttribute('target', 'receipt-capture-frame');

            console.log('✓ Hidden iframe created for receipt capture');

            // Monitor the iframe for the redirect to confirmation page
            let receiptCaptured = false;
            const checkIframeForReceipt = () => {
              try {
                const iframeDoc = receiptIframe.contentDocument || receiptIframe.contentWindow.document;
                const iframeUrl = receiptIframe.contentWindow.location.href;

                console.log('📍 Iframe URL:', iframeUrl);

                // Check if we've redirected to the confirmation page
                if (iframeUrl.includes('ArticleCcoResponse_cdo') && !receiptCaptured) {
                  receiptCaptured = true;
                  console.log('✅ Redirected to confirmation page!');

                  // Extract receipt HTML from the confirmation page
                  const receiptBody = iframeDoc.body;
                  if (receiptBody) {
                    const receiptHTML = receiptBody.innerHTML;
                    console.log('✓ Receipt HTML captured:', receiptHTML.substring(0, 200) + '...');

                    // Store receipt in sessionStorage
                    const donationData = JSON.parse(sessionStorage.getItem('bala_donation') || '{}');
                    donationData.receiptHTML = receiptHTML;
                    donationData.receiptUrl = iframeUrl;
                    sessionStorage.setItem('bala_donation', JSON.stringify(donationData));

                    // Clean up iframe
                    setTimeout(() => {
                      document.body.removeChild(receiptIframe);
                    }, 1000);

                    // Close the modal
                    document.getElementById('modalOverlay').classList.remove('show');
                    document.querySelector('.donation-modal').classList.remove('show');

                    // Show thank you overlay with receipt
                    setTimeout(() => showThankYou(), 300);
                  }
                }
              } catch (err) {
                // Cross-origin errors are expected during the submission process
                if (!err.message.includes('cross-origin')) {
                  console.log('ℹ Iframe check:', err.message);
                }
              }
            };

            // Poll the iframe every 500ms for up to 15 seconds
            let attempts = 0;
            const maxAttempts = 30; // 15 seconds total
            const intervalId = setInterval(() => {
              attempts++;
              checkIframeForReceipt();

              if (receiptCaptured || attempts >= maxAttempts) {
                clearInterval(intervalId);

                if (!receiptCaptured) {
                  console.log('⚠ Receipt capture timed out, showing thank you without receipt');
                  // Clean up iframe
                  try {
                    document.body.removeChild(receiptIframe);
                  } catch (e) {}

                  // Close modal and show thank you anyway
                  document.getElementById('modalOverlay').classList.remove('show');
                  document.querySelector('.donation-modal').classList.remove('show');
                  setTimeout(() => showThankYou(), 300);
                }
              }
            }, 500);

            submitBtn.click();
            console.log('✓ Form submitted to hidden iframe!');
          } else {
            console.log('⚠ Submit button not found, using form.submit()');
            chabadForm.submit();
          }
        }, 800); // Wait 800ms for all fields to sync (including 150ms setTimeout for Other field)
      } else {
        console.error('✗ JotForm NOT FOUND on page');
        console.log('Available forms on page:', document.querySelectorAll('form'));
        console.log('Available iframes:', document.querySelectorAll('iframe'));

        // FALLBACK: Create and submit a direct form
        console.log('🔄 FALLBACK: Creating direct submission form...');

        const formData = {
          firstName: document.getElementById('newFirstName').value,
          lastName: document.getElementById('newLastName').value,
          email: document.getElementById('newEmail').value,
          address: document.getElementById('newAddress').value,
          city: document.getElementById('newCity').value,
          state: document.getElementById('newState').value,
          zipCode: document.getElementById('newZipCode').value,
          phone: document.getElementById('newPhone').value,
          cardNumber: document.getElementById('newCardNumber').value.replace(/\s/g, ''),
          cvv: document.getElementById('newCvv').value,
          nameOnCard: document.getElementById('newNameOnCard').value,
          expiryMonth: document.getElementById('newExpiryMonth').value,
          expiryYear: document.getElementById('newExpiryYear').value,
          amount: currentSelection.amount,
          paymentType: currentSelection.type,
          recurring: currentSelection.type === 'monthly',
          dedication: getDedicationText()
        };

        console.log('📋 Form data collected:', formData);

        // Show user-friendly message with submission details
        alert('⚠️ Payment form is being set up.\n\n' +
              'Donation Details:\n' +
              '• Amount: $' + currentSelection.amount + (currentSelection.type === 'monthly' ? '/month' : '') + '\n' +
              '• Name: ' + formData.firstName + ' ' + formData.lastName + '\n' +
              '• Email: ' + formData.email + '\n\n' +
              'Please contact your administrator to:\n' +
              '1. Add JotForm embed code to the article content\n' +
              '2. Or set up direct PayArc API integration\n\n' +
              'Form data has been logged to console (F12)');

        // Close modal
        document.getElementById('modalOverlay').classList.remove('show');
        document.querySelector('.donation-modal').classList.remove('show');
      }
    }

    function syncAllFieldsToJotForm(formElement) {
      // Fill in the REAL Chabad.org generated form fields
      // Field names come from the actual HTML: q3_fullName3[first], q4_email4, etc.

      if (!formElement) {
        console.error('❌ No form element provided to syncAllFieldsToJotForm');
        return;
      }

      function setField(name, value) {
        // Search WITHIN the form element, not the whole document
        // IMPORTANT: Escape brackets in CSS selectors for field names like q3_fullName3[first]
        const escapedName = name.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
        const field = formElement.querySelector(`[name="${escapedName}"]`);
        if (field) {
          if (field.type === 'checkbox' || field.type === 'radio') {
            field.checked = true;
          } else {
            field.value = value;
          }
          field.dispatchEvent(new Event('input', { bubbles: true }));
          field.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          console.warn('Field not found:', name);
        }
      }

      // Name
      const firstName = document.getElementById('newFirstName');
      const lastName = document.getElementById('newLastName');
      if (firstName) setField('q3_fullName3[first]', firstName.value);
      if (lastName) setField('q3_fullName3[last]', lastName.value);

      // Email
      const email = document.getElementById('newEmail');
      if (email) setField('q4_email4', email.value);

      // Address
      const address = document.getElementById('newAddress');
      const city = document.getElementById('newCity');
      const state = document.getElementById('newState');
      const zip = document.getElementById('newZipCode');
      if (address) setField('q10_address[addr_line1]', address.value);
      if (city) setField('q10_address[city]', city.value);
      if (state) setField('q10_address[state]', state.value);
      if (zip) setField('q10_address[postal]', zip.value);

      // Phone (split into area code and number)
      const phone = document.getElementById('newPhone');
      if (phone && phone.value) {
        const cleaned = phone.value.replace(/\D/g, '');
        if (cleaned.length === 10) {
          setField('q6_phoneNumber6[area]', cleaned.substring(0, 3));
          setField('q6_phoneNumber6[phone]', cleaned.substring(3));
        }
      }

      // Credit Card
      const cardNum = document.getElementById('newCardNumber');
      const cvv = document.getElementById('newCvv');
      const nameOnCard = document.getElementById('newNameOnCard');
      const expMonth = document.getElementById('newExpiryMonth');
      const expYear = document.getElementById('newExpiryYear');

      if (cardNum) {
        const cleanedCard = cardNum.value.replace(/\s/g, '');
        setField('q7_payment[cc_number]', cleanedCard);

        // Trigger blur event to validate card and show CVV field
        const ccField = formElement.querySelector('[name="q7_payment\\[cc_number\\]"]');
        if (ccField) {
          ccField.dispatchEvent(new Event('blur', { bubbles: true }));
          ccField.dispatchEvent(new Event('keyup', { bubbles: true }));
        }
      }

      // Wait a moment for CVV field to become visible, then fill it
      setTimeout(() => {
        if (cvv) setField('q7_payment[cc_ccv]', cvv.value);
      }, 100);

      if (nameOnCard) setField('q7_payment[cc_nameOnCard]', nameOnCard.value);
      if (expMonth) setField('q7_payment[cc_exp_month]', expMonth.value);
      if (expYear) setField('q7_payment[cc_exp_year]', expYear.value);

      // Billing Address (same as main address)
      if (address) setField('q7_payment[addr_line1]', address.value);
      if (city) setField('q7_payment[city]', city.value);
      if (state) setField('q7_payment[state]', state.value);
      if (zip) setField('q7_payment[postal]', zip.value);
      setField('q7_payment[country]', 'United States');

      // Select credit card payment method
      setField('q7_payment[payment_method]', 'creditCard');

      // Amount - click the matching radio button
      const amount = currentSelection.amount;

      // Available preset amounts in the JotForm: 18, 36, 72, 108, 162, 360, 500
      // Check if this exact amount exists as a preset radio button
      const amountRadio = formElement.querySelector(`input[name="q8_amount"][value="${amount}"]`);

      if (amountRadio) {
        // Exact match found - use the preset radio button
        amountRadio.checked = true;
        amountRadio.click(); // Trigger click to ensure form validation
        amountRadio.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('✓ Amount radio selected:', amount);
      } else {
        // No exact match - use "Other" option for custom amounts (e.g., 180, 324)
        console.log('ℹ No preset radio for amount', amount, '- using Other field');

        const otherRadio = formElement.querySelector('#other_8');
        const otherInput = formElement.querySelector('#input_8');

        if (otherRadio && otherInput) {
          // First, uncheck all amount radios
          formElement.querySelectorAll('input[name="q8_amount"][type="radio"]').forEach(r => {
            if (r !== otherRadio) r.checked = false;
          });

          // Check and click the "Other" radio to enable the input field
          otherRadio.checked = true;
          otherRadio.click();

          // Wait a moment for the field to be enabled by the form's JavaScript
          setTimeout(() => {
            // Enable and set the input field
            otherInput.disabled = false;
            otherInput.value = amount.toString();

            // Trigger all events to ensure form processes the custom amount
            otherInput.dispatchEvent(new Event('input', { bubbles: true }));
            otherInput.dispatchEvent(new Event('change', { bubbles: true }));
            otherInput.dispatchEvent(new Event('blur', { bubbles: true }));
            otherInput.dispatchEvent(new Event('keyup', { bubbles: true }));

            // Also set via the field name directly
            setField('q8_amount[other]', amount.toString());

            console.log('✓ Custom amount set in Other field:', amount);
            console.log('  - otherRadio.checked:', otherRadio.checked);
            console.log('  - otherInput.value:', otherInput.value);
            console.log('  - otherInput.disabled:', otherInput.disabled);
          }, 150);
        } else {
          console.error('❌ Could not find Other radio (#other_8) or input (#input_8)');
        }
      }

      // Recurring payment
      if (currentSelection.type === 'monthly') {
        setField('q14_paymentrecurrence', true);
      }

      console.log('✅ All fields synced to Chabad.org form');
    }
    
    function updateChabadAmount() {
      // Clear all amount radio buttons first
      document.querySelectorAll('input[name="q8_amount"]').forEach(radio => {
        radio.checked = false;
      });

      const presetAmounts = [18, 36, 100, 180, 360, 770, 1018];
      const matchingPreset = presetAmounts.find(preset => preset === currentSelection.amount);

      if (matchingPreset) {
        const radioButton = document.querySelector(`input[name="q8_amount"][value="${matchingPreset}"]`);
        if (radioButton) {
          radioButton.checked = true;
          radioButton.click(); // Trigger the form's validation
          console.log('✓ updateChabadAmount: Selected preset', matchingPreset);
        }
      } else {
        // Use the "other" option
        const otherRadio = document.getElementById('other_8');
        const otherInput = document.getElementById('input_8');

        if (otherRadio && otherInput) {
          otherRadio.checked = true;
          otherRadio.click(); // This enables the input field
          otherRadio.value = currentSelection.amount.toString();
          otherInput.value = currentSelection.amount.toString();
          otherInput.disabled = false;
          otherInput.dispatchEvent(new Event('input', { bubbles: true }));
          otherInput.dispatchEvent(new Event('change', { bubbles: true }));
          console.log('✓ updateChabadAmount: Set custom amount', currentSelection.amount);
        }
      }
    }

    function getDedicationText() {
      const dedicationType = document.getElementById('newDedicationType').value;
      const dedicationName = (document.getElementById('newDedicationName')?.value || '').trim();
      const dedicationMsg = (document.getElementById('newDedicationMessage')?.value || '').trim();
      
      let dedication = '';
      if (dedicationType === 'honor' && dedicationName) {
        dedication = `In honor of ${dedicationName}`;
      } else if (dedicationType === 'memory' && dedicationName) {
        dedication = `In memory of ${dedicationName}`;
      } else if (dedicationType === 'celebration' && dedicationName) {
        dedication = `In celebration of ${dedicationName}`;
      } else if (dedicationType === 'custom' && dedicationMsg) {
        dedication = dedicationMsg;
      }
      
      return dedication;
    }

  // ============================================================================
  // EXPOSE PUBLIC API
  // ============================================================================
  
  // The initializeBalaForm function is already defined above
  // Just expose it through window.ChabadForms
  window.ChabadForms.init = initializeBalaForm;
  
  console.log('✅ Chabad Forms external library loaded');

})();

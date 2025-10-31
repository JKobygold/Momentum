/**
 * Chabad Forms - External JavaScript Library
 * Extracted from momentum2.html lines 2399-3588
 */

(function() {
  'use strict';

  // Initialize global namespace
  window.ChabadForms = window.ChabadForms || {};

  // ============================================================================
  // EXTRACTED CODE FROM MOMENTUM2.HTML
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
      progressBarEl.style.width = `${currentPercentage}%`;
      progressPercentageEl.textContent = `${Math.floor(currentPercentage)}%`;

      if (currentFrame >= totalFrames) {
        clearInterval(animationInterval);
        currentCountEl.textContent = targetCount;
        progressBarEl.style.width = `${targetPercentage}%`;
        progressPercentageEl.textContent = `${Math.floor(targetPercentage)}%`;
      }
    }, 1000 / fps);
  }

  function updateTierCardContent(card, tier) {
    const emoji = card.querySelector('.tier-emoji');
    const amount = card.querySelector('.tier-amount');
    const title = card.querySelector('.tier-title');
    const subtitle = card.querySelector('.tier-subtitle');
    const description = card.querySelector('.tier-description');

    if (tier.isCustom) {
      if (emoji) emoji.textContent = '✨';
      if (amount) amount.textContent = `$${tier.amount}`;
      if (title) title.textContent = 'Custom Amount';
      if (subtitle) subtitle.textContent = tier.type === 'monthly' ? 'Monthly Partner' : 'One-Time Gift';
      if (description) description.textContent = 'Your generous support helps transform our community';
    } else {
      if (emoji) emoji.textContent = tier.emoji;
      if (amount) amount.textContent = `$${tier.amount}`;
      if (title) title.textContent = tier.title;
      if (subtitle) subtitle.textContent = tier.subtitle;
      if (description) description.textContent = tier.description;
    }
  }

  function handleTierSelection(card, tier) {
    document.querySelectorAll('.tier-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');

    currentSelection = { ...tier };
    updateTierCardContent(card, tier);

    // Update the modal immediately
    updateModalContent();
    updateChabadTypeField();
    updateChabadAmount();
  }

  function handleCustomAmount() {
    const input = document.getElementById('customAmountInput');
    const value = parseFloat(input.value);

    if (!value || value <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    currentSelection = {
      amount: value,
      title: 'Custom Amount',
      subtitle: currentSelection.type === 'monthly' ? 'Monthly Partner' : 'One-Time Gift',
      description: 'Your generous support helps transform our community',
      isCustom: true,
      type: currentSelection.type
    };

    const selectedCard = document.querySelector('.tier-card.active');
    if (selectedCard) {
      updateTierCardContent(selectedCard, currentSelection);
    }

    updateModalContent();
    updateChabadTypeField();
    updateChabadAmount();
    input.value = '';
  }

  function updateModalContent() {
    const modal = document.getElementById('donationModal');
    if (!modal) return;

    const emoji = modal.querySelector('.modal-tier-emoji');
    const amount = modal.querySelector('.modal-tier-amount');
    const title = modal.querySelector('.modal-tier-title');
    const subtitle = modal.querySelector('.modal-tier-subtitle');

    if (emoji) emoji.textContent = currentSelection.isCustom ? '✨' :
      (document.querySelector('.tier-card.active .tier-emoji')?.textContent || '✨');
    if (amount) amount.textContent = `$${currentSelection.amount}`;
    if (title) title.textContent = currentSelection.title;
    if (subtitle) subtitle.textContent = currentSelection.subtitle;
  }

  function updateChabadTypeField() {
    const typeField = document.getElementById('input_3');
    if (typeField) {
      typeField.value = currentSelection.type === 'monthly' ? 'Monthly' : 'One Time';
      console.log('✓ updateChabadTypeField:', typeField.value);
    }
  }

  function handleTypeToggle(type) {
    currentSelection.type = type;

    const monthlyBtn = document.getElementById('monthlyBtn');
    const oneTimeBtn = document.getElementById('oneTimeBtn');

    monthlyBtn?.classList.toggle('active', type === 'monthly');
    oneTimeBtn?.classList.toggle('active', type === 'onetime');

    const tierDescriptions = {
      monthly: {
        subtitle: currentSelection.isCustom ? 'Monthly Partner' : currentSelection.subtitle
      },
      onetime: {
        subtitle: currentSelection.isCustom ? 'One-Time Gift' : currentSelection.subtitle
      }
    };

    currentSelection.subtitle = tierDescriptions[type].subtitle;
    updateModalContent();
    updateChabadTypeField();
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

    animateProgress();
    setupImpactPopups();

    // Set up tier card interactions
    document.querySelectorAll('.tier-card').forEach((card, index) => {
      const tiers = [
        { amount: 18, emoji: '🌱', title: 'Seed Supporter', subtitle: 'Essential Partner', description: 'Plant the seeds of Jewish growth in our community', type: 'monthly', isCustom: false },
        { amount: 54, emoji: '🌿', title: 'Garden Builder', subtitle: 'Growth Partner', description: 'Nurture Jewish life and community connection', type: 'monthly', isCustom: false },
        { amount: 100, emoji: '🌳', title: 'Chai Champion', subtitle: 'Sustaining Partner', description: 'Support vibrant Jewish programs and education', type: 'monthly', isCustom: false },
        { amount: 180, emoji: '🏛️', title: 'Gold Benefactor', subtitle: 'Founding Partner', description: 'Lead our transformation with premium recognition', type: 'monthly', isCustom: false }
      ];

      card.addEventListener('click', () => handleTierSelection(card, tiers[index]));

      if (index === 3) {
        card.classList.add('active');
      }
    });

    // Set up type toggle buttons
    document.getElementById('monthlyBtn')?.addEventListener('click', () => handleTypeToggle('monthly'));
    document.getElementById('oneTimeBtn')?.addEventListener('click', () => handleTypeToggle('onetime'));

    // Set up custom amount
    document.getElementById('customAmountBtn')?.addEventListener('click', handleCustomAmount);
    document.getElementById('customAmountInput')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleCustomAmount();
    });

    // Set up modal
    const modal = document.getElementById('donationModal');
    const donateBtn = document.getElementById('donateBtn');
    const closeBtn = document.querySelector('.close-modal');

    donateBtn?.addEventListener('click', () => {
      modal.style.display = 'flex';
      updateModalContent();
      updateChabadTypeField();
      updateChabadAmount();

      // Wait for Chabad.org form to be ready, then sync our form
      waitForChabadForm().then(() => {
        syncAllFieldsToJotForm();
      });
    });

    closeBtn?.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });

    // Set up form submission
    const form = document.getElementById('newDonationForm');
    form?.addEventListener('submit', handleFormSubmission);

    // Set up real-time field syncing
    setupFieldSync();
  }

  function waitForChabadForm(maxAttempts = 50, interval = 100) {
    return new Promise((resolve, reject) => {
      let attempts = 0;

      const checkForm = setInterval(() => {
        attempts++;
        const chabadForm = document.getElementById('input_3');

        if (chabadForm) {
          clearInterval(checkForm);
          console.log('✓ Chabad form is ready');
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkForm);
          console.error('✗ Chabad form not found after', attempts, 'attempts');
          reject(new Error('Chabad form not found'));
        }
      }, interval);
    });
  }

  function setupFieldSync() {
    const mappings = [
      { new: 'newFirstName', chabad: 'first_2' },
      { new: 'newLastName', chabad: 'last_2' },
      { new: 'newEmail', chabad: 'input_4' },
      { new: 'newPhone', chabad: 'input_10' },
      { new: 'newAddress', chabad: 'input_5' },
      { new: 'newCity', chabad: 'input_6' },
      { new: 'newState', chabad: 'input_24' },
      { new: 'newZip', chabad: 'input_25' },
      { new: 'newCardNumber', chabad: 'q7_payment[cc_number]' },
      { new: 'newExpMonth', chabad: 'q7_payment[cc_exp_month]' },
      { new: 'newExpYear', chabad: 'q7_payment[cc_exp_year]' },
      { new: 'newCVV', chabad: 'q7_payment[cc_ccv]' },
      { new: 'newNameOnCard', chabad: 'q7_payment[cc_nameOnCard]' }
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
        if (phone.length <= 10) {
          if (phone.length > 6) {
            this.value = `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
          } else if (phone.length > 3) {
            this.value = `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
          } else if (phone.length > 0) {
            this.value = `(${phone}`;
          }
        }
      });
    }

    // Card number formatting
    const cardField = document.getElementById('newCardNumber');
    if (cardField) {
      cardField.addEventListener('input', function() {
        const value = this.value.replace(/\s/g, '');
        const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
        this.value = formatted;
      });
    }
  }

  function validateForm() {
    const requiredFields = [
      'newFirstName',
      'newLastName',
      'newEmail',
      'newPhone',
      'newAddress',
      'newCity',
      'newState',
      'newZip',
      'newCardNumber',
      'newExpMonth',
      'newExpYear',
      'newCVV',
      'newNameOnCard'
    ];

    for (const fieldId of requiredFields) {
      const field = document.getElementById(fieldId);
      if (!field || !field.value.trim()) {
        alert(`Please fill in: ${field?.previousElementSibling?.textContent || fieldId}`);
        field?.focus();
        return false;
      }
    }

    // Email validation
    const email = document.getElementById('newEmail').value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address');
      return false;
    }

    // Card number validation (basic)
    const cardNumber = document.getElementById('newCardNumber').value.replace(/\s/g, '');
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      alert('Please enter a valid card number');
      return false;
    }

    return true;
  }

  function syncAllFieldsToJotForm() {
    const mappings = [
      { new: 'newFirstName', chabad: 'first_2' },
      { new: 'newLastName', chabad: 'last_2' },
      { new: 'newEmail', chabad: 'input_4' },
      { new: 'newPhone', chabad: 'input_10' },
      { new: 'newAddress', chabad: 'input_5' },
      { new: 'newCity', chabad: 'input_6' },
      { new: 'newState', chabad: 'input_24' },
      { new: 'newZip', chabad: 'input_25' }
    ];

    console.log('🔄 Syncing all fields to Chabad form...');

    mappings.forEach(mapping => {
      const newField = document.getElementById(mapping.new);
      const chabadField = document.getElementById(mapping.chabad);

      if (newField && chabadField && newField.value) {
        chabadField.value = newField.value;
        console.log(`✓ Synced ${mapping.new} → ${mapping.chabad}`);
      }
    });

    updateChabadTypeField();
    updateChabadAmount();
  }

  function handleFormSubmission(e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Get all form values
    const firstName = document.getElementById('newFirstName').value;
    const lastName = document.getElementById('newLastName').value;
    const email = document.getElementById('newEmail').value;
    const phone = document.getElementById('newPhone').value;
    const address = document.getElementById('newAddress').value;
    const city = document.getElementById('newCity').value;
    const state = document.getElementById('newState').value;
    const zip = document.getElementById('newZip').value;

    const cardNumber = document.getElementById('newCardNumber').value;
    const expMonth = document.getElementById('newExpMonth').value;
    const expYear = document.getElementById('newExpYear').value;
    const cvv = document.getElementById('newCVV').value;
    const nameOnCard = document.getElementById('newNameOnCard').value;

    console.log('📝 Form submission started...');

    // Fill all the Chabad.org form fields
    function setField(id, value) {
      const field = document.getElementById(id);
      if (field) {
        field.value = value;
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    // Personal info
    setField('first_2', firstName);
    setField('last_2', lastName);
    setField('input_4', email);
    setField('input_10', phone);
    setField('input_5', address);
    setField('input_6', city);
    setField('input_24', state);
    setField('input_25', zip);

    // Donation type
    updateChabadTypeField();

    // Amount
    updateChabadAmount();

    // Payment info - wait for JotForm to render payment fields
    setTimeout(() => {
      if (cardNumber) setField('q7_payment[cc_number]', cardNumber.replace(/\s/g, ''));

      // Wait a moment for CVV field to become visible, then fill it
      setTimeout(() => {
        if (cvv) setField('q7_payment[cc_ccv]', cvv);
      }, 100);

      if (nameOnCard) setField('q7_payment[cc_nameOnCard]', nameOnCard);
      if (expMonth) setField('q7_payment[cc_exp_month]', expMonth);
      if (expYear) setField('q7_payment[cc_exp_year]', expYear);

      // Dedication if provided
      const dedication = getDedicationText();
      if (dedication) {
        setField('input_9', dedication);
      }

      console.log('✓ All fields filled, submitting Chabad form...');

      // Submit the Chabad.org form
      setTimeout(() => {
        const chabadForm = document.querySelector('#co_content_container form, form[data-form-id]');
        if (chabadForm) {
          const submitButton = chabadForm.querySelector('button[type="submit"], input[type="submit"], .form-submit-button');

          if (submitButton) {
            submitButton.click();
            console.log('✓ Chabad form submitted!');

            // Close our modal
            document.getElementById('donationModal').style.display = 'none';

            // Show thank you overlay after a brief delay
            setTimeout(() => {
              showThankYouOverlay();
            }, 500);
          } else {
            console.error('✗ Could not find submit button');
          }
        } else {
          console.error('✗ Could not find Chabad form');
        }
      }, 200);
    }, 300);
  }

  function showThankYouOverlay() {
    const overlay = document.getElementById('thankYouOverlay');
    if (overlay) {
      overlay.style.display = 'flex';

      // Auto-close after 5 seconds
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 5000);

      // Manual close button
      const closeBtn = overlay.querySelector('.thank-you-close');
      if (closeBtn) {
        closeBtn.onclick = () => {
          overlay.style.display = 'none';
        };
      }
    }
  }

  function updateChabadAmount() {
    const amountField = document.getElementById('input_8_other');

    if (currentSelection.amount) {
      // First, try to find a matching preset button
      const presetButtons = {
        18: '18',
        36: '36',
        54: '54',
        100: '100',
        180: '180',
        360: '360',
        540: '540',
        1000: '1000',
        1800: '1800'
      };

      const matchingPreset = presetButtons[currentSelection.amount];

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

  window.ChabadForms.init = initializeBalaForm;

  console.log('✅ Chabad Forms external library loaded');

})();

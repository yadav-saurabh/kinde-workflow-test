export const moxiiAuthScript = `
  document.addEventListener('DOMContentLoaded', function() {
    // Find phone input field
    const phoneInput = document.querySelector('input[type="tel"]');
    if (phoneInput) {
      // Set placeholder
      phoneInput.setAttribute('placeholder', '000 000 0000');

      // Remove label
      const label = phoneInput.closest('.kinde-field-wrapper')?.querySelector('label');
      if (label) label.style.display = 'none';
    }

    // Disable country selector
    const countrySelect = document.querySelector('select[name*="country"], select[name*="phone_country"]');
    if (countrySelect) {
      countrySelect.disabled = true;
      countrySelect.style.pointerEvents = 'none';
      // Set to Australia (+61)
      Array.from(countrySelect.options).forEach(opt => {
        if (opt.value === 'AU' || opt.textContent.includes('+61')) {
          opt.selected = true;
        }
      });
    }

    // Kinde wraps inputs with its own containers; flatten those styles
    // so the field renders like the Flutter screens.
    const flattenInputWrappers = () => {
      const inputs = document.querySelectorAll(
        'input[type="text"], input[type="email"], input[type="tel"], input[type="password"], input[inputmode="numeric"]'
      );
      inputs.forEach((input) => {
        let node = input.parentElement;
        for (let i = 0; i < 4 && node; i += 1) {
          node.style.border = 'none';
          node.style.background = 'transparent';
          node.style.boxShadow = 'none';
          node.style.padding = '0';
          node = node.parentElement;
        }
      });
    };
    flattenInputWrappers();
  });
`;

export const moxiiOtpScript = `
  document.addEventListener('DOMContentLoaded', function() {
    const getOtpInputs = () =>
      Array.from(
        document.querySelectorAll('input[inputmode="numeric"], input[data-kinde-otp-input]')
      );

    const enhanceOtpInputs = () => {
      const otpInputs = getOtpInputs();
      otpInputs.forEach((input, index) => {
        if (input.dataset.moxiiOtpBound === 'true') {
          return;
        }

        input.dataset.moxiiOtpBound = 'true';

        // Auto-focus next input on entry
        input.addEventListener('input', function() {
          if (this.value.length === 1 && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
          }
        });

        // Handle backspace to go to previous input
        input.addEventListener('keydown', function(e) {
          if (e.key === 'Backspace' && this.value === '' && index > 0) {
            otpInputs[index - 1].focus();
          }
        });

        // Clear on tap if filled
        input.addEventListener('click', function() {
          if (this.value) {
            this.select();
          }
        });
      });

      // Auto-focus first input once.
      if (otpInputs.length > 0 && !window.__moxiiOtpFocused) {
        otpInputs[0].focus();
        window.__moxiiOtpFocused = true;
      }
    };

    // Kinde wraps inputs with its own containers; flatten those styles
    // so the field renders like the Flutter screens.
    const flattenInputWrappers = () => {
      const inputs = document.querySelectorAll(
        'input[type="text"], input[type="email"], input[type="tel"], input[type="password"], input[inputmode="numeric"]'
      );
      inputs.forEach((input) => {
        let node = input.parentElement;
        for (let i = 0; i < 4 && node; i += 1) {
          node.style.border = 'none';
          node.style.background = 'transparent';
          node.style.boxShadow = 'none';
          node.style.padding = '0';
          node = node.parentElement;
        }
      });
    };

    const applyWidgetFixes = () => {
      enhanceOtpInputs();
      flattenInputWrappers();
      wireResendButtons();
    };

    const wireResendButtons = () => {
      const resendButtons = document.querySelectorAll('[data-moxii-resend]');
      resendButtons.forEach((button) => {
        if (button.dataset.moxiiResendBound === 'true') {
          return;
        }
        button.dataset.moxiiResendBound = 'true';
        button.addEventListener('click', function() {
          window.location.reload();
        });
      });
    };

    // Apply immediately and then re-apply because Kinde can mount after DOM ready.
    applyWidgetFixes();
    [80, 250, 600, 1000].forEach((delay) => {
      setTimeout(() => {
        applyWidgetFixes();
      }, delay);
    });

    const observer = new MutationObserver(() => {
      applyWidgetFixes();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => observer.disconnect(), 5000);
  });
`;

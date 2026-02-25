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

    // Ensure submit action sits at the bottom even when Kinde nests
    // the submit button inside extra wrapper containers.
    const pinSubmitToBottom = () => {
      const submitButtons = document.querySelectorAll(
        'button[type="submit"], button[data-kinde-submit], .kinde-button-primary'
      );
      submitButtons.forEach((button) => {
        const form = button.closest('form');
        if (form) {
          form.style.display = 'flex';
          form.style.flexDirection = 'column';
          form.style.minHeight = '100%';
          form.style.height = '100%';
          form.style.flex = '1 1 auto';
        }

        const actionWrapper =
          button.closest('[class*="footer"], [class*="actions"], [data-kinde-footer], [data-kinde-actions]') ||
          button.parentElement;

        if (actionWrapper) {
          actionWrapper.style.display = 'flex';
          actionWrapper.style.flexDirection = 'column';
          actionWrapper.style.width = '100%';
          actionWrapper.style.marginTop = 'auto';
        }

        button.style.display = 'block';
        button.style.width = '100%';
        button.style.marginTop = '0';

        let node = actionWrapper ? actionWrapper.parentElement : button.parentElement;
        for (let i = 0; i < 5 && node && node !== form; i += 1) {
          if (!node.style.display || node.style.display === 'block') {
            node.style.display = 'flex';
            node.style.flexDirection = 'column';
          }
          node.style.flex = '1 1 auto';
          node.style.width = '100%';
          node = node.parentElement;
        }
      });
    };

    const applyWidgetFixes = () => {
      enhanceOtpInputs();
      flattenInputWrappers();
      pinSubmitToBottom();
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
    wireResendButtons();
    [80, 250, 600, 1000].forEach((delay) => {
      setTimeout(() => {
        applyWidgetFixes();
        wireResendButtons();
      }, delay);
    });

    const observer = new MutationObserver(() => {
      applyWidgetFixes();
      wireResendButtons();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => observer.disconnect(), 5000);
  });
`;

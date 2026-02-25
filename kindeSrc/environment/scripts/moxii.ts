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
    const ensureFlexColumn = (node, grow) => {
      if (!node) return;
      node.style.display = 'flex';
      node.style.flexDirection = 'column';
      node.style.minHeight = '0';
      if (grow) {
        node.style.flex = '1 1 auto';
      }
    };

    const ensureWidgetHeight = () => {
      const content = document.querySelector('.moxii-content');
      const widget = document.querySelector('.moxii-widget');
      if (!content || !widget) return;

      const contentRect = content.getBoundingClientRect();
      const widgetRect = widget.getBoundingClientRect();
      const available = Math.floor(contentRect.bottom - widgetRect.top);

      if (available > 0) {
        widget.style.minHeight = available + 'px';
        widget.style.height = available + 'px';
      }
    };

    const getKeyboardInset = () => {
      if (!window.visualViewport) return 0;
      return Math.max(
        0,
        Math.round(window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop)
      );
    };

    const moveNodeToDock = (node, dock, centeredText) => {
      if (!node || !dock) return;
      if (node.parentElement !== dock) {
        dock.appendChild(node);
      }

      node.style.position = 'static';
      node.style.left = 'auto';
      node.style.right = 'auto';
      node.style.bottom = 'auto';
      node.style.transform = 'none';
      node.style.width = '100%';
      node.style.maxWidth = '100%';
      if (centeredText) {
        node.style.textAlign = 'center';
      }
    };

    const findPrimaryActionElement = () => {
      const direct =
        document.querySelector('button[type="submit"]') ||
        document.querySelector('button[data-kinde-submit]') ||
        document.querySelector('.kinde-button-primary');
      if (direct) return direct;

      const candidates = Array.from(
        document.querySelectorAll('button, a[role="button"], [role="button"]')
      );
      return (
        candidates.find((el) => /continue|next|submit|verify/i.test((el.textContent || '').trim())) ||
        null
      );
    };

    const pinBottomStack = () => {
      const keyboardInset = getKeyboardInset();
      const widget = document.querySelector('.moxii-widget');
      if (!widget) return;

      widget.style.position = 'relative';
      widget.style.paddingBottom = (250 + keyboardInset) + 'px';

      let dock = widget.querySelector('[data-moxii-bottom-dock]');
      if (!dock) {
        dock = document.createElement('div');
        dock.setAttribute('data-moxii-bottom-dock', 'true');
        widget.appendChild(dock);
      }

      dock.style.position = 'absolute';
      dock.style.left = '0';
      dock.style.right = '0';
      dock.style.bottom = (14 + keyboardInset) + 'px';
      dock.style.display = 'flex';
      dock.style.flexDirection = 'column';
      dock.style.gap = '12px';
      dock.style.width = '100%';
      dock.style.zIndex = '60';
      dock.style.pointerEvents = 'auto';

      const primaryAction = findPrimaryActionElement();
      if (primaryAction) {
        const form = primaryAction.closest('form');
        if (form) {
          if (!form.id) {
            form.id = 'moxii-kinde-form';
          }
          primaryAction.setAttribute('form', form.id);
        }

        const actionWrapper =
          primaryAction.closest('[class*="footer"], [class*="actions"], [data-kinde-footer], [data-kinde-actions]') ||
          primaryAction;
        moveNodeToDock(actionWrapper, dock, false);
      }

      const fallbackActions = document.querySelectorAll(
        '[data-kinde-fallback-action], [class*="fallback-action"]'
      );
      fallbackActions.forEach((el) => {
        moveNodeToDock(el, dock, true);
      });

      const brandings = document.querySelectorAll('[data-kinde-branding], [class*="branding"]');
      brandings.forEach((el) => {
        moveNodeToDock(el, dock, true);
      });
    };

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
        const widgetRoot = button.closest('[data-kinde-widget]');
        const moxiiWidget = document.querySelector('.moxii-widget');

        ensureFlexColumn(moxiiWidget, true);
        ensureFlexColumn(widgetRoot, true);

        let widgetAncestor = widgetRoot ? widgetRoot.parentElement : null;
        for (let i = 0; i < 5 && widgetAncestor && widgetAncestor !== moxiiWidget; i += 1) {
          ensureFlexColumn(widgetAncestor, true);
          widgetAncestor = widgetAncestor.parentElement;
        }

        if (form) {
          ensureFlexColumn(form, true);
          form.style.minHeight = '100%';
          form.style.height = '100%';
        }

        const actionWrapper =
          button.closest('[class*="footer"], [class*="actions"], [data-kinde-footer], [data-kinde-actions]') ||
          button.parentElement;

        if (actionWrapper) {
          ensureFlexColumn(actionWrapper, false);
          actionWrapper.style.width = '100%';
          actionWrapper.style.marginTop = 'auto';
          actionWrapper.style.paddingBottom = '0.5rem';
        }

        button.style.display = 'block';
        button.style.width = '100%';
        button.style.marginTop = '0';

        let node = actionWrapper ? actionWrapper.parentElement : button.parentElement;
        for (let i = 0; i < 5 && node && node !== form; i += 1) {
          ensureFlexColumn(node, true);
          node.style.width = '100%';
          node = node.parentElement;
        }
      });
    };

    const applyWidgetFixes = () => {
      ensureWidgetHeight();
      enhanceOtpInputs();
      flattenInputWrappers();
      pinSubmitToBottom();
      pinBottomStack();
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
    window.addEventListener('resize', applyWidgetFixes);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', applyWidgetFixes);
      window.visualViewport.addEventListener('scroll', applyWidgetFixes);
    }
  });
`;

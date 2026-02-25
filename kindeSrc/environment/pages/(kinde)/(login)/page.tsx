"use server";
import React from "react";
import { renderToString } from "react-dom/server.browser";
import {
  getKindeRequiredCSS,
  getKindeRequiredJS,
  getKindeNonce,
  getKindeWidget,
  getKindeCSRF,
  getSVGFaviconUrl,
  setKindeDesignerCustomProperties
} from "@kinde/infrastructure";

/**
 * Moxii Login Page
 * Matches the Figma design for phone number login
 */
const MoxiiLoginPage = async ({request, context}) => {
  return (
    <html lang={request.locale.lang} dir={request.locale.isRtl ? "rtl" : "ltr"}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="robots" content="noindex" />
        <meta name="csrf-token" content={getKindeCSRF()} />
        <title>Sign in - Moxii</title>
        
        <link rel="icon" href={getSVGFaviconUrl()} type="image/svg+xml" />
        {getKindeRequiredCSS()}
        {getKindeRequiredJS()}
        
        {/* Kinde designer custom properties */}
        <style nonce={getKindeNonce()}>{`
          :root {
            ${setKindeDesignerCustomProperties({
              baseBackgroundColor: "#F6EFE7",
              baseLinkColor: "#2F7CF6",
              buttonBorderRadius: "24px",
              primaryButtonBackgroundColor: "#A64BFF",
              primaryButtonColor: "#FFFFFF",
              inputBorderRadius: "16px",
              baseColor: "#1D1B1A",
              baseFontFamily: "'Space Grotesk', -apple-system, system-ui, BlinkMacSystemFont, Helvetica, Arial, sans-serif"
            })}
          }
        `}</style>
        
        {/* Moxii custom styles */}
        <style nonce={getKindeNonce()}>{`
          /* Import Space Grotesk font */
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
          
          /* Moxii color palette */
          :root {
            --moxii-canvas: #F6EFE7;
            --moxii-ink: #1D1B1A;
            --moxii-subtle: #6F6A64;
            --moxii-muted: #B7B0A8;
            --moxii-outline: #E1D7CC;
            --moxii-primary: #A64BFF;
            --moxii-primary-dark: #7B34E1;
            --moxii-accent: #F04FD6;
            --moxii-disabled: #D9D4CE;
            --moxii-chip: #F0E7DC;
            --moxii-link: #2F7CF6;
            --moxii-white: #FFFFFF;
            --moxii-flag-red: #CF142B;

            /* Kinde settings overrides (preferred customization path) */
            --kinde-base-background-color: var(--moxii-canvas);
            --kinde-base-color: var(--moxii-ink);
            --kinde-base-font-family: 'Space Grotesk', -apple-system, system-ui, sans-serif;
            --kinde-base-focus-outline-width: 0;
            --kinde-base-focus-outline-style: none;
            --kinde-base-focus-outline-color: transparent;
            --kinde-base-focus-outline-offset: 0;
            --kinde-button-primary-background-color: var(--moxii-primary);
            --kinde-button-primary-color: var(--moxii-white);
            --kinde-button-border-radius: 1.5rem;
            --kinde-button-primary-border-radius: 1.5rem;
            --kinde-shared-color-invalid: var(--moxii-flag-red);
            --kinde-control-associated-text-invalid-message-color: var(--moxii-flag-red);
            --kinde-control-select-text-background-color: transparent;
            --kinde-control-select-text-border-width: 0;
            --kinde-control-select-text-border-style: solid;
            --kinde-control-select-text-border-color: transparent;
            --kinde-control-select-text-border-radius: 0;
            --kinde-control-select-text-color: var(--moxii-ink);
            --kinde-control-select-text-font-size: 1.5rem;
            --kinde-control-select-text-font-weight: 500;
          }
          
          * {
            box-sizing: border-box;
          }
          
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            font-family: 'Space Grotesk', -apple-system, system-ui, sans-serif;
            background: var(--moxii-canvas);
            color: var(--moxii-ink);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          /* Main container */
          .moxii-container {
            min-height: 100vh;
            min-height: 100dvh;
            display: flex;
            flex-direction: column;
            padding: 1.5rem 1.25rem;
            max-width: 100%;
            position: relative;
          }
          
          /* Content area */
          .moxii-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: 0;
          }
          
          .moxii-title {
            font-size: 20px;
            font-weight: 600;
            line-height: 1.3;
            color: var(--moxii-ink);
            margin: 0 0 0.5rem 0;
          }
          
          .moxii-subtitle {
            font-size: 14px;
            line-height: 1.4;
            color: var(--moxii-subtle);
            margin: 0 0 1.25rem 0;
          }
          
          /* Widget wrapper - ensure full height */
          .moxii-widget {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-height: 0;
          }
          
          /* Kinde widget form - make it fill space */
          [data-kinde-widget] form,
          .moxii-widget form,
          form[data-kinde-form] {
            display: flex !important;
            flex-direction: column !important;
            flex: 1 !important;
            min-height: 100% !important;
          }
          
          /* Push button to bottom */
          [data-kinde-widget] form button[type="submit"],
          .moxii-widget form button[type="submit"],
          form[data-kinde-form] button[type="submit"],
          button[data-kinde-submit],
          .kinde-button-primary,
          button.kinde-button {
            margin-top: auto !important;
            margin-bottom: 0 !important;
          }
          
          /* Form fields at top */
          [data-kinde-widget] form > div:not(:has(button)),
          .moxii-widget form > div:not(:has(button)) {
            flex: 0 0 auto;
            margin-bottom: 1rem;
          }
          
          /* Primary button customization */
          button[type="submit"],
          .kinde-button-primary {
            width: 100%;
            height: 48px;
            border-radius: 24px;
            background: var(--moxii-primary);
            color: var(--moxii-white);
            border: none;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
          }
          
          button[type="submit"]:hover:not(:disabled),
          .kinde-button-primary:hover:not(:disabled) {
            background: var(--moxii-primary-dark);
          }
          
          button[type="submit"]:disabled,
          .kinde-button-primary:disabled {
            background: var(--moxii-disabled);
            color: var(--moxii-subtle);
            cursor: not-allowed;
          }
          
          /* Input field customization */
          [data-kinde-widget] input[type="text"],
          [data-kinde-widget] input[type="tel"],
          [data-kinde-widget] input[type="email"],
          [data-kinde-widget] input[type="password"] {
            width: 100%;
            padding: 8px 0;
            border: none !important;
            border-radius: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 24px;
            font-weight: 500;
            color: var(--moxii-ink);
          }
          
          /* Phone input specific - no border */
          [data-kinde-widget] input[type="tel"] {
            padding-left: 0;
            font-size: 28px;
            font-weight: 400;
            letter-spacing: 0.5px;
          }
          
          [data-kinde-widget] input[type="text"]::placeholder,
          [data-kinde-widget] input[type="tel"]::placeholder,
          [data-kinde-widget] input[type="email"]::placeholder,
          [data-kinde-widget] input[type="password"]::placeholder {
            color: var(--moxii-muted);
          }
          
          /* Phone placeholder with lighter color */
          [data-kinde-widget] input[type="tel"]::placeholder {
            color: #D9D4CE;
            font-weight: 300;
          }
          
          [data-kinde-widget] input[type="text"]:focus,
          [data-kinde-widget] input[type="tel"]:focus,
          [data-kinde-widget] input[type="email"]:focus,
          [data-kinde-widget] input[type="password"]:focus {
            outline: none !important;
            border-color: transparent !important;
            box-shadow: none !important;
          }
          
          /* Remove Kinde wrapper borders around inputs */
          [data-kinde-widget] [class*="input-wrapper"],
          [data-kinde-widget] [class*="field-input"],
          [data-kinde-widget] [class*="form-input"],
          [data-kinde-widget] [data-kinde-field-input] {
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          
          /* Hide labels for phone inputs */
          label[for*="phone"] {
            display: none !important;
          }
          
          /* Phone input container styling */
          .kinde-phone-input-container,
          [class*="phone"] input[type="tel"] {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          /* Country selector - disable and style */
          select[name*="country"],
          select[name*="phone_country"],
          .kinde-country-selector {
            pointer-events: none;
            border: none;
            background: transparent;
            font-size: 28px;
            font-weight: 400;
            color: var(--moxii-ink);
            padding: 0;
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
          }
          
          /* Hide dropdown arrow on country selector */
          select[name*="country"]::-ms-expand,
          select[name*="phone_country"]::-ms-expand {
            display: none;
          }
          
          /* Phone number input wrapper */
          .kinde-field-wrapper[data-field-type="phone"],
          div[class*="phone-field"] {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 1rem 0;
          }
          
          /* Flag icon styling */
          .kinde-flag-icon,
          [class*="flag"] {
            width: 28px;
            height: 28px;
            border-radius: 50%;
          }
          
          /* Links */
          a {
            color: var(--moxii-link);
            text-decoration: none;
            font-weight: 600;
          }
          
          a:hover {
            text-decoration: underline;
          }
          
          /* Error messages */
          .kinde-error-message,
          [role="alert"] {
            padding: 12px;
            border-radius: 12px;
            background: rgba(207, 20, 43, 0.1);
            border: 1px solid rgba(207, 20, 43, 0.3);
            color: var(--moxii-flag-red);
            font-size: 13px;
            font-weight: 500;
            margin-top: 12px;
          }
          
          /* Responsive design */
          @media (min-width: 768px) {
            .moxii-container {
              max-width: 480px;
              margin: 0 auto;
              padding: 2rem 1.5rem;
            }
          }
          
          /* Mobile optimization */
          @media (max-width: 767px) {
            .moxii-container {
              padding: 1rem;
            }
            
            .moxii-title {
              font-size: 18px;
            }
          }
        `}</style>
        
        {/* Phone input customization script */}
        <script nonce={getKindeNonce()}>{`
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
        `}</script>
      </head>
      <body>
        <div className="moxii-container">
          <div className="moxii-content">
            <h1 className="moxii-title">Welcome back!</h1>
            <p className="moxii-subtitle">Sign in to continue</p>
            
            <div className="moxii-widget">
              {getKindeWidget()}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

export default async function Page(event) {
  const page = await MoxiiLoginPage({...event});
  return renderToString(page);
}

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
 * Moxii Phone OTP Verification Page
 * Matches the Figma design for code verification
 */
const MoxiiPhoneOTPPage = async ({request, context}) => {
  return (
    <html lang={request.locale.lang} dir={request.locale.isRtl ? "rtl" : "ltr"}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="robots" content="noindex" />
        <meta name="csrf-token" content={getKindeCSRF()} />
        <title>Enter verification code - Moxii</title>
        
        <link rel="icon" href={getSVGFaviconUrl()} type="image/svg+xml" />
        {getKindeRequiredCSS()}
        {getKindeRequiredJS()}
        
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
              baseFontFamily: "'Space Grotesk', sans-serif"
            })}
          }
        `}</style>
        
        <style nonce={getKindeNonce()}>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
          
          :root {
            --moxii-canvas: #F6EFE7;
            --moxii-ink: #1D1B1A;
            --moxii-subtle: #6F6A64;
            --moxii-muted: #B7B0A8;
            --moxii-outline: #E1D7CC;
            --moxii-primary: #A64BFF;
            --moxii-primary-dark: #7B34E1;
            --moxii-link: #2F7CF6;
            --moxii-white: #FFFFFF;
            --moxii-disabled: #D9D4CE;
            --moxii-flag-red: #CF142B;
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
          }
          
          .moxii-otp-container {
            min-height: 100vh;
            min-height: 100dvh;
            display: flex;
            flex-direction: column;
            padding: 1.5rem 1.25rem;
            max-width: 100%;
            position: relative;
          }
          
          .moxii-header {
            margin-bottom: 1.5rem;
          }
          
          .moxii-back-button {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: 1px solid var(--moxii-outline);
            background: var(--moxii-white);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            transition: background 0.2s;
          }
          
          .moxii-back-button:hover {
            background: var(--moxii-chip);
          }
          
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
          
          /* OTP input specific styles - matches Figma */
          input[data-kinde-otp-input],
          input[type="text"][inputmode="numeric"],
          input[type="tel"],
          .kinde-otp-input input {
            font-size: 24px !important;
            font-weight: 500 !important;
            letter-spacing: 0;
            text-align: center;
            border: 1px solid var(--moxii-outline) !important;
            background: var(--moxii-white) !important;
            border-radius: 12px !important;
            padding: 16px 8px !important;
            width: 48px !important;
            height: 56px !important;
            margin: 0 4px !important;
          }
          
          input[data-kinde-otp-input]:focus,
          input[type="text"][inputmode="numeric"]:focus,
          .kinde-otp-input input:focus {
            outline: none !important;
            border-color: var(--moxii-primary) !important;
            border-width: 2px !important;
          }
          
          /* OTP container */
          .kinde-otp-input-container,
          [data-kinde-otp-container] {
            display: flex !important;
            justify-content: center !important;
            gap: 8px !important;
            margin: 1rem 0 !important;
          }
          
          /* Resend code link */
          .moxii-resend-link {
            text-align: center;
            margin: 1.25rem 0;
          }
          
          .moxii-resend-link button,
          .moxii-resend-link a {
            background: none;
            border: none;
            color: var(--moxii-link);
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            font-family: 'Space Grotesk', sans-serif;
          }
          
          .moxii-resend-link button:hover,
          .moxii-resend-link a:hover {
            text-decoration: underline;
          }
          
          /* Helper text */
          .moxii-helper-text {
            text-align: center;
            font-size: 13px;
            font-weight: 500;
            color: var(--moxii-muted);
            margin-top: 0.75rem;
          }
          
          /* Primary button */
          button[type="submit"] {
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
          }
          
          button[type="submit"]:hover:not(:disabled) {
            background: var(--moxii-primary-dark);
          }
          
          button[type="submit"]:disabled {
            background: var(--moxii-disabled);
            color: var(--moxii-subtle);
            cursor: not-allowed;
          }
          
          /* Input field */
          input[type="text"] {
            width: 100%;
            padding: 14px 16px;
            border-radius: 16px;
            border: 1px solid var(--moxii-outline);
            background: var(--moxii-white);
            font-family: 'Space Grotesk', sans-serif;
            font-size: 16px;
            font-weight: 500;
            color: var(--moxii-ink);
          }
          
          input[type="text"]::placeholder {
            color: var(--moxii-muted);
          }
          
          input[type="text"]:focus {
            outline: none;
            border-color: var(--moxii-primary);
          }
          
          /* Error messages */
          [role="alert"] {
            padding: 12px;
            border-radius: 12px;
            background: rgba(207, 20, 43, 0.1);
            border: 1px solid rgba(207, 20, 43, 0.3);
            color: var(--moxii-flag-red);
            font-size: 13px;
            font-weight: 500;
            margin-top: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          @media (min-width: 768px) {
            .moxii-otp-container {
              max-width: 480px;
              margin: 0 auto;
              padding: 2rem 1.5rem;
            }
          }
          
          @media (max-width: 767px) {
            .moxii-otp-container {
              padding: 1rem;
            }
            
            .moxii-title {
              font-size: 18px;
            }
          }
        `}</style>
        
        {/* OTP input enhancement script */}
        <script nonce={getKindeNonce()}>{`
          document.addEventListener('DOMContentLoaded', function() {
            // Find all OTP input fields
            const otpInputs = document.querySelectorAll('input[inputmode="numeric"], input[data-kinde-otp-input]');
            
            otpInputs.forEach((input, index) => {
              // Auto-focus next input on entry
              input.addEventListener('input', function(e) {
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
            
            // Auto-focus first input
            if (otpInputs.length > 0) {
              otpInputs[0].focus();
            }
          });
        `}</script>
      </head>
      <body>
        <div className="moxii-otp-container">
          <div className="moxii-header">
            <button 
              className="moxii-back-button"
              type="button" 
              onclick="window.history.back()"
              aria-label="Go back"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path 
                  d="M12.5 15L7.5 10L12.5 5" 
                  stroke="#A64BFF" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          
          <div className="moxii-content">
            <h1 className="moxii-title">We sent you a six-digit code.</h1>
            {context.widget.content.description && (
              <p className="moxii-subtitle">{context.widget.content.description}</p>
            )}
            
            <div className="moxii-widget">
              {getKindeWidget()}
              
              <div className="moxii-resend-link">
                <button type="button" onclick="window.location.reload()">
                  Resend code
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

export default async function Page(event) {
  const page = await MoxiiPhoneOTPPage({...event});
  return renderToString(page);
}

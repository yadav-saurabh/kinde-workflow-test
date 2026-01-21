"use server";
import React from "react";
import { renderToString } from "react-dom/server.browser";
import {
  getKindeRequiredCSS,
  getKindeRequiredJS,
  getKindeNonce,
  getKindeWidget,
  getKindeCSRF,
  getLogoUrl,
  getSVGFaviconUrl,
  setKindeDesignerCustomProperties
} from "@kinde/infrastructure";

/**
 * Default Moxii authentication page
 * Matches the Zentara mobile app design system
 */
const MoxiiLayout = async ({request, context}) => {
  return (
    <html lang={request.locale.lang} dir={request.locale.isRtl ? "rtl" : "ltr"}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="robots" content="noindex" />
        <meta name="csrf-token" content={getKindeCSRF()} />
        <title>{context.widget.content.page_title}</title>
        
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
            display: flex;
            flex-direction: column;
            padding: 1.5rem 1.25rem;
            max-width: 100%;
          }
          
          /* Header with back button */
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
          }
          
          .moxii-back-button:hover {
            background: var(--moxii-chip);
          }
          
          /* Content area */
          .moxii-content {
            flex: 1;
            display: flex;
            flex-direction: column;
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
          
          /* Widget wrapper */
          .moxii-widget {
            flex: 1;
            display: flex;
            flex-direction: column;
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
          input[type="text"],
          input[type="tel"],
          input[type="email"],
          input[type="password"] {
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
          
          input[type="text"]::placeholder,
          input[type="tel"]::placeholder,
          input[type="email"]::placeholder,
          input[type="password"]::placeholder {
            color: var(--moxii-muted);
          }
          
          input[type="text"]:focus,
          input[type="tel"]:focus,
          input[type="email"]:focus,
          input[type="password"]:focus {
            outline: none;
            border-color: var(--moxii-primary);
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
      </head>
      <body>
        <div className="moxii-container">
          <div className="moxii-header">
            <button 
              className="moxii-back-button" 
              onClick="history.back()"
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
            <h1 className="moxii-title">{context.widget.content.heading}</h1>
            {context.widget.content.description && (
              <p className="moxii-subtitle">{context.widget.content.description}</p>
            )}
            
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
  const page = await MoxiiLayout({...event});
  return renderToString(page);
}

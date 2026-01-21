'use server';

import { getKindeNonce, getKindeRequiredCSS, getKindeWidget, type KindePageEvent } from '@kinde/infrastructure';
import React from 'react';
import { renderToString } from 'react-dom/server.browser';

type PhoneOTPVerifyPageProps = KindePageEvent & { widget: React.ReactNode };

const PhoneOTPVerifyPage: React.FC<PhoneOTPVerifyPageProps> = ({ context, request, widget }) => {
  const heading = context.widget.content.heading || "We sent you a six-digit code.";
  const description = context.widget.content.description || "";
  const backHref = request.route.flow ? `/${request.route.flow}` : "/login";
  
  return (
    <html lang={request.locale.lang} dir={request.locale.isRtl ? 'rtl' : 'ltr'}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>{context.widget.content.pageTitle}</title>
        {getKindeRequiredCSS()}
        <style nonce={getKindeNonce()}>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
            background: #F6EFE7 !important;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            padding: 0;
            margin: 0;
          }
          
          .container {
            background: white;
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 20px 24px 0;
            max-width: 480px;
            width: 100%;
            margin: 0 auto;
            min-height: 100vh;
          }
          
          .back-button {
            background: none;
            border: none;
            color: #A64BFF;
            font-size: 32px;
            cursor: pointer;
            padding: 8px;
            margin: 0 0 24px -8px;
            display: inline-flex;
            align-items: center;
            line-height: 1;
            font-weight: 300;
            width: 40px;
            height: 40px;
            justify-content: center;
          }
          
          .back-button:active {
            opacity: 0.6;
          }
          
          .heading {
            font-size: 26px;
            font-weight: 600;
            color: #1D1B1A;
            margin-bottom: 16px;
            line-height: 1.3;
            letter-spacing: -0.3px;
          }
          
          .description {
            font-size: 15px;
            color: #757575;
            margin-bottom: 32px;
            line-height: 1.4;
          }
          
          .widget-container {
            width: 100%;
            flex: 1;
          }
          
          /* Custom styling for OTP input */
          .widget-container [data-kinde-form-field] {
            margin-bottom: 24px;
          }

          .widget-container [data-kinde-control-otp] {
            font-size: 20px !important;
            padding: 16px !important;
            border: 1px solid #E0E0E0 !important;
            border-radius: 12px !important;
            width: 100%;
            font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace !important;
            background: white !important;
            letter-spacing: 8px !important;
            text-align: center !important;
            box-shadow: none !important;
          }
          
          .widget-container [data-kinde-control-otp]:focus {
            outline: none !important;
            border-color: #A64BFF !important;
            box-shadow: 0 0 0 3px rgba(107, 70, 255, 0.1) !important;
          }
          
          .widget-container [data-kinde-control-otp]::placeholder {
            letter-spacing: 4px;
            color: #BDBDBD;
          }
          
          .widget-container button[type="submit"],
          .widget-container [data-kinde-button] {
            background: #A64BFF;
            color: white;
            border: none;
            border-radius: 12px;
            padding: 16px;
            font-size: 17px;
            font-weight: 600;
            width: 100%;
            cursor: pointer;
            margin-top: 0;
            font-family: inherit;
            transition: background 0.2s;
          }
          
          .widget-container button[type="submit"]:hover,
          .widget-container [data-kinde-button]:hover {
            background: #7B34E1;
          }
          
          .widget-container button[type="submit"]:active,
          .widget-container [data-kinde-button]:active {
            background: #7B34E1;
          }
          
          .widget-container button[type="submit"]:disabled,
          .widget-container [data-kinde-button]:disabled {
            background: #E0E0E0;
            color: #9E9E9E;
            cursor: not-allowed;
          }
          
          /* Resend code link */
          .widget-container a {
            color: #A64BFF;
            text-decoration: none;
            font-size: 15px;
            display: inline-block;
            margin-top: 16px;
            font-weight: 500;
          }
          
          .widget-container a:hover {
            text-decoration: underline;
          }
          
          .widget-container a:active {
            opacity: 0.6;
          }
          
          @media (max-width: 480px) {
            .container {
              padding: 16px 20px 0;
            }
            
            .heading {
              font-size: 24px;
              margin-bottom: 12px;
            }
            
            .description {
              font-size: 14px;
              margin-bottom: 28px;
            }
          }
          
          /* iOS style adjustments */
          @supports (-webkit-touch-callout: none) {
            .container {
              padding-top: max(20px, env(safe-area-inset-top));
              padding-bottom: env(safe-area-inset-bottom);
            }
          }
        `}</style>
      </head>
      <body>
        <div className="container" data-kinde-root="true">
          <a className="back-button" href={backHref} aria-label="Go back">
            ‹
          </a>
          <h1 className="heading">{heading}</h1>
          {description && <p className="description">{description}</p>}
          <div className="widget-container">
            {widget}
          </div>
        </div>
      </body>
    </html>
  );
};

export default async function Page(event: KindePageEvent): Promise<string> {
  const widget = await getKindeWidget();
  const page = <PhoneOTPVerifyPage {...event} widget={widget} />;
  return renderToString(page);
}

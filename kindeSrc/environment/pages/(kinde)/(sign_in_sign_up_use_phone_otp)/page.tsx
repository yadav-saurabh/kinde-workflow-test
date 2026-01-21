'use server';

import { getKindeNonce, getKindeRequiredCSS, getKindeWidget, type KindePageEvent } from '@kinde/infrastructure';
import React from 'react';
import { renderToString } from 'react-dom/server.browser';

type PhoneOTPPageProps = KindePageEvent & { widget: React.ReactNode };

const PhoneOTPPage: React.FC<PhoneOTPPageProps> = ({ context, request, widget }) => {
  const heading = context.widget.content.heading || "Welcome, let's start with your mobile number.";
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
            color: #1A1A2E;
            margin-bottom: 32px;
            line-height: 1.3;
            letter-spacing: -0.3px;
          }

          .widget-container {
            width: 100%;
            flex: 1;
          }

          :root {
            --kinde-button-border-radius: 100px;
            --kinde-primary-button-background-color: #A64BFF;
            --kinde-primary-button-hover-background-color: #7B34E1;
            --kinde-input-border-radius: 0;
            --kinde-input-background-color: transparent;
            --kinde-input-border-color: #E0E0E0;
            --kinde-input-focus-border-color: #A64BFF;
            --kinde-input-box-shadow: none;
            --kinde-input-focus-box-shadow: none;
          }

          [data-kinde-form-field-name="given_name"],
          [data-kinde-form-field-name="family_name"] {
            display: none !important;
          }

          [data-kinde-control-input] {
            font-size: 17px !important;
            padding: 8px 0 !important;
            border: none !important;
            border-bottom: 1px solid var(--kinde-input-border-color) !important;
            border-radius: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
          }

          [data-kinde-control-input]:focus {
            outline: none !important;
            border-bottom-color: var(--kinde-input-focus-border-color) !important;
          }

          [data-kinde-control-select-text] {
            font-size: 17px !important;
            padding: 8px 0 !important;
            border: none !important;
            border-bottom: 1px solid var(--kinde-input-border-color) !important;
            border-radius: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
          }

          @media (max-width: 480px) {
            .container {
              padding: 16px 20px 0;
            }

            .heading {
              font-size: 24px;
              margin-bottom: 28px;
            }
          }

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
  const page = <PhoneOTPPage {...event} widget={widget} />;
  return renderToString(page);
}

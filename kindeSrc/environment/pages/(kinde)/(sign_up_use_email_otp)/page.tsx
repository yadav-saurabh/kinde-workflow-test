'use server';

import { getKindeRequiredCSS, getKindeWidget, type KindePageEvent } from '@kinde/infrastructure';
import React from 'react';
import { renderToString } from 'react-dom/server.browser';

type SignUpEmailOTPPageProps = KindePageEvent & { widget: React.ReactNode };

const SignUpEmailOTPPage: React.FC<SignUpEmailOTPPageProps> = ({ context, request, widget }) => {
  const heading = context.widget.content.heading || "We sent you a six-digit code.";
  const description = context.widget.content.description || "";
  
  return (
    <html lang={request.locale.lang} dir={request.locale.isRtl ? 'rtl' : 'ltr'}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>{context.widget.content.pageTitle}</title>
        {getKindeRequiredCSS()}
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
            background: #F6EFE7;
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
          
          .widget-container input[type="text"],
          .widget-container input[type="tel"] {
            font-size: 20px;
            padding: 16px;
            border: 1px solid #E0E0E0;
            border-radius: 12px;
            width: 100%;
            font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
            background: white;
            letter-spacing: 8px;
            text-align: center;
          }
          
          .widget-container input[type="text"]:focus,
          .widget-container input[type="tel"]:focus {
            outline: none;
            border-color: #A64BFF;
            box-shadow: 0 0 0 3px rgba(107, 70, 255, 0.1);
          }
          
          .widget-container input[type="text"]::placeholder {
            letter-spacing: 4px;
            color: #BDBDBD;
          }
          
          .widget-container button[type="submit"] {
            background: #A64BFF;
            color: white;
            border: none;
            border-radius: 12px;
            padding: 16px;
            font-size: 17px;
            font-weight: 600;
            width: 100%;
            cursor: pointer;
            margin-top: 24px;
            font-family: inherit;
            transition: background 0.2s;
          }
          
          .widget-container button[type="submit"]:hover {
            background: #7B34E1;
          }
          
          .widget-container button[type="submit"]:active {
            background: #7B34E1;
          }
          
          .widget-container button[type="submit"]:disabled {
            background: #E0E0E0;
            color: #9E9E9E;
            cursor: not-allowed;
          }
          
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
          <a className="back-button" href="/" aria-label="Go back">
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
  const page = <SignUpEmailOTPPage {...event} widget={widget} />;
  return renderToString(page);
}

'use server';

import { getKindeWidget, type KindePageEvent } from '@kinde/infrastructure';
import React from 'react';
import { renderToString } from 'react-dom/server.browser';

type DefaultPageProps = KindePageEvent & { widget: React.ReactNode };

const DefaultPage: React.FC<DefaultPageProps> = ({ context, request, widget }) => {
  return (
    <html lang={request.locale.lang} dir={request.locale.isRtl ? 'rtl' : 'ltr'}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{context.widget.content.pageTitle}</title>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #F6EFE7;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          
          .container {
            background: white;
            border-radius: 24px;
            padding: 40px 24px;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
          }
          
          .back-button {
            background: none;
            border: none;
            color: #A64BFF;
            border-color: #A64BFF;
            font-size: 28px;
            cursor: pointer;
            padding: 8px;
            margin: -8px 0 16px -8px;
            display: inline-flex;
            align-items: center;
            line-height: 1;
          }
          
          .heading {
            font-size: 24px;
            font-weight: 600;
            color: #1D1B1A;
            margin-bottom: 32px;
            line-height: 1.3;
          }
          
          .widget-container {
            width: 100%;
          }
          
          @media (max-width: 480px) {
            .container {
              padding: 32px 20px;
            }
            
            .heading {
              font-size: 22px;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <a className="back-button" href="javascript:history.back()" aria-label="Go back">
            ‹
          </a>
          <h1 className="heading">{context.widget.content.heading}</h1>
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
  const page = <DefaultPage {...event} widget={widget} />;
  return renderToString(page);
}

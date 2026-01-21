"use server";

import {
  getKindeRequiredCSS,
  getKindeNonce,
  getKindeWidget,
  type KindePageEvent,
} from "@kinde/infrastructure";
import React from "react";
import { renderToString } from "react-dom/server.browser";

type DefaultPageProps = KindePageEvent & { widget: React.ReactNode };

const DefaultPage: React.FC<DefaultPageProps> = ({
  context,
  request,
  widget,
}) => {
  const backHref = request.route.flow ? `/${request.route.flow}` : "/login";
  return (
    <html lang={request.locale.lang} dir={request.locale.isRtl ? "rtl" : "ltr"}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{context.widget.content.pageTitle}</title>
        {getKindeRequiredCSS()}
        <style nonce={getKindeNonce()}>{`
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

          .widget-container input[type="tel"] {
            padding: 0;
            border: none;
            border-bottom: 1px solid #e0e0e0;
            border-radius: 0;
            background: transparent;
          }

          .widget-container select {
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            pointer-events: none;
            background: transparent;
            border: none;
            padding: 0;
          }

          .widget-container select::-ms-expand {
            display: none;
          }

          .widget-container label[for*="first_name"],
          .widget-container label[for*="last_name"],
          .widget-container input[name*="first_name"],
          .widget-container input[name*="last_name"],
          .widget-container input[name*="given_name"],
          .widget-container input[name*="family_name"],
          .widget-container input[id*="first_name"],
          .widget-container input[id*="last_name"] {
            display: none !important;
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
        <div className="container" data-kinde-root="true">
          <a className="back-button" href={backHref} aria-label="Go back">
            ‹
          </a>
          <h1 className="heading">{context.widget.content.heading}</h1>
          <div className="widget-container">{widget}</div>
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

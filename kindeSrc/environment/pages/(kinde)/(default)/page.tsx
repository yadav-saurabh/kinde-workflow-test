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
            background: #F6EFE7 !important;
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

          .widget-container [data-kinde-form-field] {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 16px;
          }

          .widget-container [data-kinde-control-label] {
            font-size: 14px;
            color: #1A1A2E;
            font-weight: 500;
          }

          .widget-container [data-kinde-control-select-text],
          .widget-container input[type="tel"] {
            font-size: 17px;
            padding: 0 !important;
            border: none !important;
            border-bottom: 1px solid #E0E0E0 !important;
            border-radius: 0 !important;
            width: 100%;
            font-family: inherit;
            background: transparent !important;
            box-shadow: none !important;
          }

          .widget-container [data-kinde-control-select-text]:focus,
          .widget-container input[type="tel"]:focus {
            outline: none;
            border-bottom-color: #A64BFF !important;
            box-shadow: none !important;
          }

          .widget-container select {
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            pointer-events: none;
            background: transparent;
            border: none;
            padding: 0;
            font-size: 17px;
            color: #1A1A2E;
            background-image: none;
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
            margin-top: 16px;
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

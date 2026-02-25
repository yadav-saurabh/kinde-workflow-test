"use server";

import React from "react";
import {
  getKindeCSRF,
  getKindeNonce,
  getKindeRequiredCSS,
  getKindeRequiredJS,
  getKindeWidget,
  getSVGFaviconUrl,
  setKindeDesignerCustomProperties,
} from "@kinde/infrastructure";
import { moxiiDesignerCustomProperties } from "../styles/moxii";

const MOXII_UI_VERSION = "UI v2026.02.25.2";

type MoxiiPageShellProps = {
  request: { locale: { lang: string; isRtl: boolean } };
  title: string;
  heading: React.ReactNode;
  description?: React.ReactNode;
  styles: string;
  script?: string;
  containerClassName?: string;
  children?: React.ReactNode;
};

export const MoxiiPageShell = ({
  request,
  title,
  heading,
  description,
  styles,
  script,
  containerClassName = "moxii-container",
  children,
}: MoxiiPageShellProps): React.JSX.Element => {
  const nonce = getKindeNonce();

  return (
    <html lang={request.locale.lang} dir={request.locale.isRtl ? "rtl" : "ltr"}>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <meta name="robots" content="noindex" />
        <meta name="csrf-token" content={getKindeCSRF()} />
        <title>{title}</title>

        <link rel="icon" href={getSVGFaviconUrl()} type="image/svg+xml" />
        {getKindeRequiredCSS()}
        {getKindeRequiredJS()}

        <style nonce={nonce}>{`
          :root {
            ${setKindeDesignerCustomProperties(moxiiDesignerCustomProperties)}
          }
        `}</style>
        <style nonce={nonce}>{styles}</style>
        {script ? <script nonce={nonce}>{script}</script> : null}
      </head>
      <body>
        <div className={containerClassName}>
          <div
            style={{
              position: "fixed",
              right: "12px",
              top: "12px",
              zIndex: 9999,
              background: "rgba(0,0,0,0.65)",
              color: "#fff",
              borderRadius: "999px",
              padding: "4px 8px",
              fontSize: "11px",
              lineHeight: 1.2,
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            {MOXII_UI_VERSION}
          </div>
          <div className="moxii-content">
            <h1 className="moxii-title">{heading}</h1>
            {description ? <p className="moxii-subtitle">{description}</p> : null}
            <div className="moxii-widget">
              {getKindeWidget()}
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

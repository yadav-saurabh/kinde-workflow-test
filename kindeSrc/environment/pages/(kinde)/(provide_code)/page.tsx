"use server";

import React from "react";
import { renderToString } from "react-dom/server.browser";
import { MoxiiPageShell } from "../../../components/moxii-page-shell";
import { moxiiOtpScript } from "../../../scripts/moxii";
import { moxiiOtpStyles } from "../../../styles/moxii";

export default async function Page(event) {
  const { request, context } = event;

  const page = (
    <MoxiiPageShell
      request={request}
      title="Enter verification code"
      heading="We sent you a six-digit code."
      description={context.widget.content.description}
      styles={moxiiOtpStyles}
      script={moxiiOtpScript}
      containerClassName="moxii-otp-container"
    >
      <div className="moxii-resend-link">
        <button type="button" data-moxii-resend="true">
          Resend code
        </button>
      </div>
    </MoxiiPageShell>
  );

  return renderToString(page);
}

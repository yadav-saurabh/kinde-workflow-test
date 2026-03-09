"use server";

import React from "react";
import { renderToString } from "react-dom/server.browser";
import { MoxiiPageShell } from "../../../components/moxii-page-shell";
import { moxiiAuthScript } from "../../../scripts/moxii";
import { moxiiAuthStyles } from "../../../styles/moxii";

export default async function Page(event) {
  const { request } = event;

  const page = (
    <MoxiiPageShell
      request={request}
      title="Register - Moxii"
      heading="Welcome, let's start with your mobile number."
      description="Get started today!"
      styles={moxiiAuthStyles}
      script={moxiiAuthScript}
      containerClassName="moxii-container"
    />
  );

  return renderToString(page);
}

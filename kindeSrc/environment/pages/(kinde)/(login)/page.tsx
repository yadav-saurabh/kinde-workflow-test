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
      title="Sign in - Moxii"
      heading="Welcome back!"
      description="Sign in to continue"
      styles={moxiiAuthStyles}
      script={moxiiAuthScript}
      containerClassName="moxii-container"
    />
  );

  return renderToString(page);
}

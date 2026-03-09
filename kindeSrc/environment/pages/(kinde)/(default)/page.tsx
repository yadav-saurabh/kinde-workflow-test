"use server";

import React from "react";
import { renderToString } from "react-dom/server.browser";
import { MoxiiPageShell } from "../../../components/moxii-page-shell";
import { moxiiAuthScript } from "../../../scripts/moxii";
import { moxiiAuthStyles } from "../../../styles/moxii";

export default async function Page(event) {
  const { request, context } = event;

  const page = (
    <MoxiiPageShell
      request={request}
      title={context.widget.content.page_title}
      heading={context.widget.content.heading}
      description={context.widget.content.description}
      styles={moxiiAuthStyles}
      script={moxiiAuthScript}
      containerClassName="moxii-container"
    />
  );

  return renderToString(page);
}

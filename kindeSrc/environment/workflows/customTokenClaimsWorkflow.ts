/**
 * Kinde Token Generation Workflow
 *
 * Runs during JWT token generation to add custom Moxii claims.
 * Called EVERY time a token is generated (login, refresh, etc.).
 *
 * The user must already exist in the Moxii database
 * (created by postUserAuthenticationWorkflow on first login).
 *
 * Claims added to the access token:
 *   { userId, userType, tenantId, tenantCode, roleCode, customerId?, permissions[] }
 *
 * No profile data (name, email, phone) is included — that comes from
 * the backend API via GET /customers/:id.
 */

import {
  WorkflowSettings,
  WorkflowTrigger,
  onUserTokenGeneratedEvent,
  getEnvironmentVariable,
  fetch,
  createKindeAPI,
  accessTokenCustomClaims,
} from "@kinde/infrastructure";

export const workflowSettings: WorkflowSettings = {
  id: "tokenGeneration",
  name: "Token Generation - Add Roles and Permissions to access token",
  trigger: WorkflowTrigger.UserTokenGeneration,
  bindings: {
    "kinde.fetch": {}, // TODO: use secureFetch when crypto/aes: invalid key size 0 is fixed by Kinde
    "kinde.env": {},
    "kinde.accessToken": {},
    "kinde.idToken": {},
    url: {},
  },
};

type KindeAppProperties = {
  code: string;
  message: string;
  properties: Array<{
    id: string;
    key: string;
    name: string;
    value: string;
    description: string;
  }>;
};

async function getAppNameFromKinde(
  event: onUserTokenGeneratedEvent,
  clientId: string,
): Promise<string> {
  try {
    const kindeAPI = await createKindeAPI(event);
    const response: { data: KindeAppProperties } = await kindeAPI.get({
      endpoint: `applications/${encodeURIComponent(clientId)}/properties`,
    });

    if (response.data?.properties) {
      const appNameProperty = response.data.properties.find(
        (prop) => prop.key === "kp_app_name",
      );
      return appNameProperty?.value || clientId;
    }

    throw new Error("kp_app_name not defined");
  } catch {
    return clientId;
  }
}

async function getOrgExternalId(
  event: onUserTokenGeneratedEvent,
  orgCode: string,
): Promise<string | undefined> {
  try {
    const kindeAPI = await createKindeAPI(event);
    const response: { data: { code: string; external_id?: string } } =
      await kindeAPI.get({
        endpoint: `organization?code=${orgCode}`,
      });

    return response.data.external_id;
  } catch (e) {
    console.error("Failed to fetch org external ID", e);
    return undefined;
  }
}

type AppUserType = "STAFF" | "CUSTOMER";

function determineUserType(appName: string): AppUserType | "UNKNOWN" {
  const lowerAppName = appName.toLowerCase();

  if (lowerAppName.includes("staff") || lowerAppName.includes("admin")) {
    return "STAFF";
  }

  if (lowerAppName.includes("customer") || lowerAppName.includes("client")) {
    return "CUSTOMER";
  }

  throw new Error("unknown kp_app_name value");
}

type ClaimsPayload = {
  kindeUserId: string;
  orgCode?: string;
  orgExternalId?: string;
};

async function getStaffClaims(apiBaseUrl: string, payload: ClaimsPayload) {
  const response = await fetch<{
    userId: string;
    userType: string;
    tenantId: string;
    tenantCode: string;
    roleCode: string;
    roleName?: string;
    roleId?: string;
    permissions: string[];
    statusCode?: number;
    error?: string;
    message?: string;
  }>(`${apiBaseUrl}/entities/auth/claims`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload as unknown as URLSearchParams,
    responseFormat: "json",
  });

  if (!response) {
    throw new Error("Failed to retrieve staff claims from backend");
  }

  const claims = (response as any).data || response;

  if (claims.statusCode && claims.statusCode >= 400) {
    console.error(
      `[Moxii] Staff claims endpoint returned error: ${claims.statusCode} - ${claims.message}`,
    );
    throw new Error(
      `Failed to retrieve staff claims: ${claims.message || claims.error || "Unknown error"}`,
    );
  }

  if (!claims.userId || !claims.tenantId || !claims.roleCode) {
    console.error(
      `[Moxii] Staff claims response missing required fields. Got: ${JSON.stringify(claims)}`,
    );
    throw new Error("Staff claims response is incomplete");
  }

  return claims;
}

async function getCustomerClaims(
  apiBaseUrl: string,
  payload: ClaimsPayload,
) {
  const response = await fetch<{
    userId: string;
    userType: string;
    tenantId: string;
    tenantCode: string;
    roleCode: string;
    customerId: string;
    permissions: string[];
    statusCode?: number;
    error?: string;
    message?: string;
  }>(`${apiBaseUrl}/customers/auth/claims`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload as unknown as URLSearchParams,
    responseFormat: "json",
  });

  if (!response) {
    throw new Error("Failed to retrieve customer claims from backend");
  }

  const claims = (response as any).data || response;

  if (claims.statusCode && claims.statusCode >= 400) {
    console.error(
      `[Moxii] Customer claims endpoint returned error: ${claims.statusCode} - ${claims.message}`,
    );
    throw new Error(
      `Failed to retrieve customer claims: ${claims.message || claims.error || "Unknown error"}`,
    );
  }

  if (!claims.userId || !claims.tenantId || !claims.roleCode) {
    console.error(
      `[Moxii] Customer claims response missing required fields. Got: ${JSON.stringify(claims)}`,
    );
    throw new Error("Customer claims response is incomplete");
  }

  return claims;
}

export default async function (event: onUserTokenGeneratedEvent) {
  const userId = event.context.user.id;
  const orgCode = event.context.organization?.code;
  const application = event.context.application;
  const clientId = application?.clientId || "";

  const appName = await getAppNameFromKinde(event, clientId);

  let orgExternalId;
  if (orgCode) {
    orgExternalId = await getOrgExternalId(event, orgCode);
  }

  const apiBaseUrl = getEnvironmentVariable("MOXII_API_BASE_URL").value;
  if (!apiBaseUrl) {
    throw new Error("Missing API configuration");
  }

  let claims;
  const userType = determineUserType(appName);
  const payload: ClaimsPayload = { kindeUserId: userId, orgCode, orgExternalId };

  if (userType === "STAFF") {
    claims = await getStaffClaims(apiBaseUrl, payload);
  } else if (userType === "CUSTOMER") {
    claims = await getCustomerClaims(apiBaseUrl, payload);
  } else {
    throw new Error(
      `Unknown user type for app: ${appName}. Configure application property kp_app_name to 'staff' or 'customer'.`,
    );
  }

  if (!claims) {
    throw new Error("Failed to retrieve user claims from backend");
  }

  const accessToken = accessTokenCustomClaims<{
    user: typeof claims;
  }>();
  accessToken.user = claims;
}

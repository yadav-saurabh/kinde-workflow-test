/**
 * Kinde Token Generation Workflow
 *
 * This workflow runs during JWT token generation to add custom Moxii claims.
 * It's called EVERY time a token is generated (login, refresh, etc.).
 *
 * IMPORTANT: The user must already exist in the Moxii database
 * (created by post-authentication.ts workflow on first login).
 *
 * Features:
 * - Gets application properties from Kinde Management API
 * - Uses kp_app_name property for app name (if set)
 * - Supports user_type parameter from auth URL (takes priority over app name)
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

function toURLSearchParams(obj: Record<string, unknown>): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  return params;
}

async function getStaffClaims(
  apiBaseUrl: string,
  kindeUserId: string,
  orgCode?: string,
) {
  const payload = { kindeUserId, orgCode };
  const response = await fetch<{
    userId: string;
    userType: string;
    tenantId: string;
    tenantCode: string;
    roleCode: string;
    roleName?: string;
    roleId?: string;
    permissions: string[];
  }>(`${apiBaseUrl}/entities/auth/claims`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload as unknown as URLSearchParams,
    responseFormat: "json",
  });

  if (!response) {
    throw new Error("Failed to retrieve staff claims from backend");
  }

  return response;
}

async function getCustomerClaims(
  apiBaseUrl: string,
  kindeUserId: string,
  orgCode?: string,
) {
  const payload = { kindeUserId, orgCode };
  const response = await fetch<{
    userId: string;
    userType: string;
    tenantId: string;
    tenantCode: string;
    roleCode: string;
    customerId: string;
    permissions: string[];
  }>(`${apiBaseUrl}/customers/auth/claims`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload as unknown as URLSearchParams,
    responseFormat: "json",
  });

  if (!response) {
    throw new Error("Failed to retrieve customer claims from backend");
  }

  return response;
}

export default async function (event: onUserTokenGeneratedEvent) {
  const userId = event.context.user.id;
  const orgCode = event.context.organization?.code;
  const application = event.context.application;
  const clientId = application?.clientId || "";

  const appName = await getAppNameFromKinde(event, clientId);

  const apiBaseUrl = getEnvironmentVariable("MOXII_API_BASE_URL").value;
  if (!apiBaseUrl) {
    throw new Error("Missing API configuration");
  }

  let claims;
  const userType = determineUserType(appName);

  if (userType === "STAFF") {
    claims = await getStaffClaims(apiBaseUrl, userId, orgCode);
  } else if (userType === "CUSTOMER") {
    claims = await getCustomerClaims(apiBaseUrl, userId, orgCode);
  } else {
    throw new Error(
      `Unknown user type for app: ${appName}. Configure application property kp_app_name to 'staff' or 'customer'.`,
    );
  }

  if (!claims) {
    throw new Error("Failed to retrieve user claims from backend");
  }

  const accessToken = accessTokenCustomClaims<{
    roles: string[];
    permissions: string[];
  }>();
  accessToken.roles = claims.roles;
  accessToken.permissions = claims.permissions;
}

/**
 * Kinde Token Generation Workflow
 *
 * This workflow runs during JWT token generation to add custom Moxii claims.
 * It's called EVERY time a token is generated (login, refresh, etc.).
 *
 * Flow:
 * 1. Kinde is generating a JWT token
 * 2. This workflow runs → Calls /auth/claims endpoint
 * 3. Entity/Customer service returns Moxii claims
 * 4. Claims are embedded in the JWT token
 * 5. User receives JWT with custom Moxii claims
 *
 * IMPORTANT: The user must already exist in the Moxii database
 * (created by post-authentication.ts workflow on first login)
 */

import {
  WorkflowSettings,
  WorkflowTrigger,
  onUserTokenGeneratedEvent,
  getEnvironmentVariable,
  fetch,
  accessTokenCustomClaims,
  idTokenCustomClaims,
} from "@kinde/infrastructure";

export const workflowSettings: WorkflowSettings = {
  id: "tokenGeneration",
  name: "Token Generation - Add Moxii Claims to JWT",
  trigger: WorkflowTrigger.UserTokenGeneration,
  bindings: {
    "kinde.fetch": {},
    "kinde.env": {},
    "kinde.accessToken": {},
    "kinde.idToken": {},
    url: {},
  },
};

/**
 * Main workflow function
 */
export default async function (event: onUserTokenGeneratedEvent) {
  const userId = event.context.user.id;

  // Get organization code if user is part of an org
  const orgCode = event.context.organization?.code;

  // Get app name to determine which service to call
  const appName = event.context.application?.clientId || "";

  console.log(`[Moxii] Token generation workflow triggered:`, {
    userId,
    orgCode,
    appName,
  });

  // Get API configuration
  const apiBaseUrl = getEnvironmentVariable("MOXII_API_BASE_URL").value;
  const apiKey = getEnvironmentVariable("MOXII_KINDE_WORKFLOW_API_KEY").value;

  if (!apiBaseUrl || !apiKey) {
    console.error(
      "[Moxii] Missing API configuration. Cannot add Moxii claims to token.",
    );
    throw new Error("Missing API configuration - cannot generate token");
  }

  try {
    // Determine user type and endpoint
    const userType = determineUserType(appName);

    let claims;
    if (userType === "STAFF") {
      claims = await getStaffClaims(apiBaseUrl, apiKey, userId, orgCode);
    } else if (userType === "CUSTOMER") {
      claims = await getCustomerClaims(apiBaseUrl, apiKey, userId, orgCode);
    } else {
      console.error(`[Moxii] Unknown user type for app: ${appName}`);
      throw new Error(`Unknown user type for app: ${appName}`);
    }

    if (!claims) {
      console.error(`[Moxii] No claims returned from API`);
      throw new Error("Failed to retrieve user claims from backend");
    }

    // Add Moxii claims to access token and ID token
    const accessToken = accessTokenCustomClaims<typeof claims>();
    const idToken = idTokenCustomClaims<typeof claims>();

    Object.assign(accessToken, claims);
    Object.assign(idToken, claims);

    console.log(`[Moxii] Claims added to token:`, claims);
  } catch (error) {
    console.error("[Moxii] Error in token generation workflow:", error);
    // Throw error to prevent token generation if claims cannot be retrieved
    throw error;
  }
}

/**
 * Determine user type from Kinde application name
 */
function determineUserType(appName: string): "STAFF" | "CUSTOMER" | "UNKNOWN" {
  const lowerAppName = appName.toLowerCase();

  if (
    lowerAppName.includes("staff") ||
    lowerAppName.includes("admin") ||
    lowerAppName.includes("backoffice")
  ) {
    return "STAFF";
  }

  if (
    lowerAppName.includes("customer") ||
    lowerAppName.includes("client") ||
    lowerAppName.includes("portal")
  ) {
    return "CUSTOMER";
  }

  return "UNKNOWN";
}

/**
 * Convert object to URLSearchParams
 */
function toURLSearchParams(obj: Record<string, unknown>): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  return params;
}

/**
 * Get claims for staff users from entity-service
 */
async function getStaffClaims(
  apiBaseUrl: string,
  apiKey: string,
  kindeUserId: string,
  orgCode?: string,
) {
  console.log(`[Moxii] Getting STAFF claims:`, { kindeUserId, orgCode });

  const payload = {
    kindeUserId,
    orgCode,
  };

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
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: toURLSearchParams(payload),
    responseFormat: "json",
  });

  if (!response) {
    console.error("[Moxii] Failed to get staff claims: No response");
    throw new Error("Failed to retrieve staff claims from backend");
  }

  console.log(`[Moxii] Staff claims received:`, response);
  return response;
}

/**
 * Get claims for customer users from customer-service
 */
async function getCustomerClaims(
  apiBaseUrl: string,
  apiKey: string,
  kindeUserId: string,
  orgCode?: string,
) {
  console.log(`[Moxii] Getting CUSTOMER claims:`, { kindeUserId, orgCode });

  const payload = {
    kindeUserId,
    orgCode,
  };

  const response = await fetch<{
    userId: string;
    userType: string;
    tenantId: string;
    tenantCode: string;
    roleCode: string;
    customerId: string;
    permissions: string[];
  }>(`${apiBaseUrl}/customers/customers/auth/claims`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: toURLSearchParams(payload),
    responseFormat: "json",
  });

  if (!response) {
    console.error("[Moxii] Failed to get customer claims: No response");
    throw new Error("Failed to retrieve customer claims from backend");
  }

  console.log(`[Moxii] Customer claims received:`, response);
  return response;
}

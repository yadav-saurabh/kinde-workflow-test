/**
 * Kinde Post-Authentication Workflow
 *
 * This workflow runs AFTER a user successfully authenticates with Kinde.
 * It creates/updates the user in your Moxii database (Staff or Customer).
 *
 * IMPORTANT: This is separate from the token generation workflow.
 * This creates the user record, while token-generation.ts adds claims to the JWT.
 *
 * Flow:
 * 1. User logs in to Kinde
 * 2. This workflow runs → Creates user in Moxii DB
 * 3. Token generation workflow runs → Adds Moxii claims to JWT
 * 4. User receives JWT with claims
 */

import {
  WorkflowSettings,
  WorkflowTrigger,
  onPostAuthenticationEvent,
  getEnvironmentVariable,
  fetch,
} from "@kinde/infrastructure";

export const workflowSettings: WorkflowSettings = {
  id: "postUserAuthentication",
  name: "Post Authentication - Create/Update User in Moxii",
  trigger: WorkflowTrigger.PostAuthentication,
  bindings: {
    "kinde.fetch": {},
    "kinde.env": {},
  },
};

/**
 * Main workflow function
 */
export default async function (event: onPostAuthenticationEvent) {
  const userId = event.context.user.id;
  const isNewKindeUser = event.context.auth.isNewUserRecordCreated;

  // Get organization code if user is part of an org
  const orgCode = event.request.authUrlParams?.orgCode;

  // Get app name to determine which service to call
  const appName = event.context.application?.clientId || "";

  console.log(`[Moxii] Post-auth workflow triggered:`, {
    userId,
    isNewKindeUser,
    orgCode,
    appName,
  });

  // Skip if not a new user (we only create on first login)
  if (!isNewKindeUser) {
    console.log(`[Moxii] Existing user, skipping creation`);
    return;
  }

  // Get API configuration from Kinde environment variables
  const apiBaseUrl = getEnvironmentVariable("MOXII_API_BASE_URL").value;
  const apiKey = getEnvironmentVariable("MOXII_KINDE_WORKFLOW_API_KEY").value;

  if (!apiBaseUrl || !apiKey) {
    console.error(
      "[Moxii] Missing API configuration. Set MOXII_API_BASE_URL and MOXII_KINDE_WORKFLOW_API_KEY in Kinde env vars",
    );
    throw new Error("Missing API configuration - cannot create user");
  }

  try {
    // Determine user type based on app name
    const userType = determineUserType(appName);

    if (userType === "STAFF") {
      await createStaffUser(apiBaseUrl, apiKey, userId, orgCode);
    } else if (userType === "CUSTOMER") {
      await createCustomerUser(apiBaseUrl, apiKey, userId, orgCode);
    } else {
      console.error(`[Moxii] Unknown user type for app: ${appName}`);
      throw new Error(`Unknown user type for app: ${appName}`);
    }
  } catch (error) {
    console.error("[Moxii] Error in post-auth workflow:", error);
    // Throw error to prevent user creation in Kinde if backend fails
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
 * Create staff user in entity-service
 */
async function createStaffUser(
  apiBaseUrl: string,
  apiKey: string,
  kindeUserId: string,
  orgCode?: string,
) {
  console.log(`[Moxii] Creating STAFF user:`, { kindeUserId, orgCode });

  const payload = {
    kindeUserId,
    orgCode,
  };

  const response = await fetch<{ error?: string }>(
    `${apiBaseUrl}/entities/staff`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: toURLSearchParams(payload),
      responseFormat: "json",
    },
  );

  if (!response || response.error) {
    console.error("[Moxii] Failed to create staff user:", response);
    throw new Error("Failed to create staff user in backend");
  }

  console.log(`[Moxii] Staff user created:`, response);
  return response;
}

/**
 * Create customer user in customer-service
 */
async function createCustomerUser(
  apiBaseUrl: string,
  apiKey: string,
  kindeUserId: string,
  orgCode?: string,
) {
  console.log(`[Moxii] Creating CUSTOMER user:`, { kindeUserId, orgCode });

  const payload = {
    kindeUserId,
    orgCode,
  };

  const response = await fetch<{ error?: string }>(
    `${apiBaseUrl}/customers/customers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: toURLSearchParams(payload),
      responseFormat: "json",
    },
  );

  if (!response || response.error) {
    console.error("[Moxii] Failed to create customer user:", response);
    throw new Error("Failed to create customer user in backend");
  }

  console.log(`[Moxii] Customer user created:`, response);
  return response;
}

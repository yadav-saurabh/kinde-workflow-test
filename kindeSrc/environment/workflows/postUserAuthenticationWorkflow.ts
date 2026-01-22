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
  secureFetch,
  createKindeAPI,
} from "@kinde/infrastructure";

export const workflowSettings: WorkflowSettings = {
  id: "postUserAuthentication",
  name: "Post Authentication - Create/Update User in Moxii",
  trigger: WorkflowTrigger.PostAuthentication,
  bindings: {
    "kinde.secureFetch": {},
    "kinde.env": {},
    "kinde.fetch": {}, // Enable Kinde Management API access
    url: {},
  },
};

/**
 * Main workflow function
 */
export default async function (event: onPostAuthenticationEvent) {
  // Log full event object for testing/debugging (keep for testing with user_type parameter)
  console.log("[Moxii] Full event object:", event);

  const userId = event.context.user.id;
  const isNewKindeUser = event.context.auth.isNewUserRecordCreated;

  // Get organization code if user is part of an org
  const orgCode = event.request.authUrlParams?.orgCode;

  // Get user_type from URL parameters (passed as &user_type=STAFF or &user_type=CUSTOMER)
  // const userTypeParam = event.request.authUrlParams?.user_type?.toUpperCase();
  const userTypeParam = "";

  // Get application properties from Kinde (clientId identifies the app)
  const application = event.context.application;
  const clientId = application?.clientId || "";

  // Fetch application properties from Kinde Management API
  let appName = clientId; // Default to clientId if API call fails
  let appProperties: { name?: string } | null = null;

  try {
    const kindeAPI = await createKindeAPI(event);
    console.log(clientId);
    const data = await kindeAPI.get({
      endpoint: `applications/${clientId}/properties`,
    });
    console.log(data);
    // Extract application name from properties (prioritize explicit name over ID)

    console.log(`[Moxii] Application properties from Kinde API:`, data);
  } catch (error) {
    console.error(
      "[Moxii] Failed to fetch application properties from Kinde API:",
      error,
    );
    console.log(error);
    // Fall back to clientId if API call fails
  }

  console.log(`[Moxii] Post-auth workflow triggered:`, {
    userId,
    isNewKindeUser,
    orgCode,
    userTypeParam,
    appName,
    clientId,
    applicationProperties: appProperties,
  });

  // Skip if not a new user (we only create on first login)
  if (!isNewKindeUser) {
    console.log(`[Moxii] Existing user, skipping creation`);
    return;
  }

  // Get API configuration from Kinde environment variables
  const apiBaseUrl = getEnvironmentVariable("MOXII_API_BASE_URL").value;

  if (!apiBaseUrl) {
    console.error(
      "[Moxii] Missing API configuration. Set MOXII_API_BASE_URL and MOXII_KINDE_WORKFLOW_API_KEY in Kinde env vars",
    );
    throw new Error("Missing API configuration - cannot create user");
  }

  try {
    // Determine user type based on user_type URL parameter (priority) or app name (fallback)
    const userType = determineUserType(userTypeParam, appName);

    if (userType === "STAFF") {
      await createStaffUser(apiBaseUrl, userId, orgCode);
    } else if (userType === "CUSTOMER") {
      await createCustomerUser(apiBaseUrl, userId, orgCode);
    } else {
      console.error(
        `[Moxii] Unknown user type for app: ${appName} (clientId: ${clientId})`,
      );
      throw new Error(
        `Unknown user type for app: ${appName}. Configure application name/ID to contain 'staff', 'admin', 'backoffice', 'management' for staff users, or 'customer', 'client', 'portal', 'mobile', 'app' for customers. Pass user_type=STAFF or user_type=CUSTOMER in auth URL to override automatic detection.`,
      );
    }
  } catch (error) {
    console.error("[Moxii] Error in post-auth workflow:", error);
    // Throw error to prevent user creation in Kinde if backend fails
    throw error;
  }
}

/**
 * Determine user type from user_type parameter or application name
 * Priority: user_type URL parameter > appName detection
 */
function determineUserType(
  userTypeParam: string | undefined,
  appName: string,
): "STAFF" | "CUSTOMER" | "UNKNOWN" {
  // If user_type is explicitly passed via URL parameter, use it directly
  if (userTypeParam) {
    const upperParam = userTypeParam.toUpperCase();
    console.log(`[Moxii] Using explicit user_type parameter: ${upperParam}`);
    if (upperParam === "STAFF") {
      console.log(`[Moxii] User type determined: STAFF (from URL parameter)`);
      return "STAFF";
    }
    if (upperParam === "CUSTOMER") {
      console.log(
        `[Moxii] User type determined: CUSTOMER (from URL parameter)`,
      );
      return "CUSTOMER";
    }
    console.error(`[Moxii] Unknown user_type parameter: ${upperParam}`);
    throw new Error(
      `Unknown user_type parameter: ${upperParam}. Must be 'STAFF' or 'CUSTOMER'.`,
    );
  }

  // Otherwise, determine from app name (existing behavior)
  const lowerAppName = appName.toLowerCase();
  console.log(`[Moxii] Determining user type from app name: "${appName}"`);

  // Staff applications
  if (
    lowerAppName.includes("staff") ||
    lowerAppName.includes("admin") ||
    lowerAppName.includes("backoffice") ||
    lowerAppName.includes("management") ||
    lowerAppName.includes("portal-staff")
  ) {
    console.log(`[Moxii] User type determined: STAFF (from app name)`);
    return "STAFF";
  }

  // Customer applications
  if (
    lowerAppName.includes("customer") ||
    lowerAppName.includes("client") ||
    lowerAppName.includes("portal") ||
    lowerAppName.includes("mobile") ||
    lowerAppName.includes("app")
  ) {
    console.log(`[Moxii] User type determined: CUSTOMER (from app name)`);
    return "CUSTOMER";
  }

  console.log(`[Moxii] User type determined: UNKNOWN for app: "${appName}"`);
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
  kindeUserId: string,
  orgCode?: string,
) {
  console.log(`[Moxii] Creating STAFF user:`, { kindeUserId, orgCode });

  const payload = {
    kindeUserId,
    orgCode,
  };

  const response = await secureFetch<{ error?: string }>(
    `${apiBaseUrl}/entities/staff/kinde`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
  kindeUserId: string,
  orgCode?: string,
) {
  console.log(`[Moxii] Creating CUSTOMER user:`, { kindeUserId, orgCode });

  const payload = {
    kindeUserId,
    orgCode,
  };

  const response = await secureFetch<{ error?: string }>(
    `${apiBaseUrl}/customers/customers/kinde`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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

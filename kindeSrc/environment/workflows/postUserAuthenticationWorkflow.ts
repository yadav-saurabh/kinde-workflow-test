/**
 * Kinde Post-Authentication Workflow
 *
 * This workflow runs AFTER a user successfully authenticates with Kinde.
 * It creates/updates a user in your Moxii database (Staff or Customer).
 *
 * Features:
 * - Gets application properties from Kinde Management API
 * - Uses kp_app_name property for app name (if set)
 * - Supports user_type parameter from auth URL (takes priority over app name)
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
  event: onPostAuthenticationEvent,
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

type Payload = { kindeUserId; orgCode };

async function createStaffUser(
  apiBaseUrl: string,
  payload: Payload,
): Promise<void> {
  const response = await secureFetch<{ error?: string }>(
    `${apiBaseUrl}/entities/staff/kinde`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: toURLSearchParams(payload),
      responseFormat: "json",
    },
  );

  if (!response || response.error) {
    throw new Error("Failed to create staff user in backend");
  }
}

async function createCustomerUser(
  apiBaseUrl: string,
  payload: Payload,
): Promise<void> {
  console.log(payload);
  console.log(toURLSearchParams(payload));
  console.log(payload);
  const response = await secureFetch<{ error?: string }>(
    `${apiBaseUrl}/customers/customers/kinde`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: toURLSearchParams(payload),
      responseFormat: "json",
    },
  );

  if (!response || response.error) {
    throw new Error("Failed to create customer user in backend");
  }
}

export default async function (event: onPostAuthenticationEvent) {
  const isNewKindeUser = event.context.auth.isNewUserRecordCreated;

  if (!isNewKindeUser) {
    return;
  }

  const userId = event.context.user.id;
  const orgCode = (event.request as any).authUrlParams?.orgCode;
  const application = event.context.application;
  const clientId = application?.clientId || "";

  const appName = await getAppNameFromKinde(event, clientId);

  const apiBaseUrl = getEnvironmentVariable("MOXII_API_BASE_URL").value;
  if (!apiBaseUrl) {
    throw new Error("Missing API configuration");
  }

  const userType = determineUserType(appName);

  if (userType === "STAFF") {
    await createStaffUser(apiBaseUrl, { kindeUserId: userId, orgCode });
  } else if (userType === "CUSTOMER") {
    await createCustomerUser(apiBaseUrl, { kindeUserId: userId, orgCode });
  } else {
    throw new Error(
      `Unknown user type for app: ${appName}. Configure application property kp_app_name to 'staff' or 'customer'.`,
    );
  }
}

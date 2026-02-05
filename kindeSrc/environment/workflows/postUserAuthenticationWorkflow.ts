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
  fetch,
  createKindeAPI,
} from "@kinde/infrastructure";

export const workflowSettings: WorkflowSettings = {
  id: "postUserAuthentication",
  name: "Post Authentication - Create/Update User in database",
  trigger: WorkflowTrigger.PostAuthentication,
  bindings: {
    "kinde.fetch": {}, // TODO: use secureFetch when crypto/aes: invalid key size 0 is fixed by Kinde
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

type KindeUser = {
  id: string;
  email?: string;
  preferred_email?: string;
  phone_number?: string;
  first_name?: string;
  last_name?: string;
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

async function getUserDetails(
  event: onPostAuthenticationEvent,
  userId: string,
): Promise<{ email?: string; phone?: string } | undefined> {
  try {
    const kindeAPI = await createKindeAPI(event);
    const response: { data: KindeUser } = await kindeAPI.get({
      endpoint: `user?id=${userId}`,
    });

    return {
      email: response.data.email || response.data.preferred_email,
      phone: response.data.phone_number,
    };
  } catch (e) {
    console.error("Failed to fetch user details", e);
    return undefined;
  }
}

async function getOrgExternalId(
  event: onPostAuthenticationEvent,
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

type Payload = {
  kindeUserId: string;
  orgCode: string;
  email?: string;
  phone?: string;
  orgExternalId?: string;
};

async function createStaffUser(
  apiBaseUrl: string,
  payload: Payload,
): Promise<void> {
  const response = await fetch<{ error?: string }>(
    `${apiBaseUrl}/entities/auth/post-authentication`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload as unknown as URLSearchParams,
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
  const response = await fetch<{ error?: string }>(
    `${apiBaseUrl}/customers/auth/post-authentication`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload as unknown as URLSearchParams,
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

  let email: string | undefined;
  let phone: string | undefined;

  try {
    const userDetails = await getUserDetails(event, userId);
    email = userDetails?.email;
    phone = userDetails?.phone;
  } catch (e) {
    console.warn("Could not fetch user details", e);
  }

  let orgExternalId;
  if (orgCode) {
    orgExternalId = await getOrgExternalId(event, orgCode);
  }

  const appName = await getAppNameFromKinde(event, clientId);

  const apiBaseUrl = getEnvironmentVariable("MOXII_API_BASE_URL").value;
  if (!apiBaseUrl) {
    throw new Error("Missing API configuration");
  }

  const userType = determineUserType(appName);

  if (userType === "STAFF") {
    await createStaffUser(apiBaseUrl, {
      kindeUserId: userId,
      orgCode,
      email,
      phone,
      orgExternalId,
    });
  } else if (userType === "CUSTOMER") {
    await createCustomerUser(apiBaseUrl, {
      kindeUserId: userId,
      orgCode,
      email,
      phone,
      orgExternalId,
    });
  } else {
    throw new Error(
      `Unknown user type for app: ${appName}. Configure application property kp_app_name to 'staff' or 'customer'.`,
    );
  }
}

import {
  WorkflowSettings,
  WorkflowTrigger,
  onUserTokenGeneratedEvent,
  getEnvironmentVariable,
  fetch,
  accessTokenCustomClaims,
} from "@kinde/infrastructure";

export const workflowSettings: WorkflowSettings = {
  id: "customTokenClaims",
  name: "Custom Token Claims - Add Roles and Permissions",
  trigger: WorkflowTrigger.UserTokenGeneration,
  bindings: {
    "kinde.fetch": {},
    "kinde.env": {},
    "kinde.accessToken": {},
  },
};

/**
 * Custom Token Claims Workflow
 * This workflow runs when Kinde generates JWT tokens
 * It fetches user roles and permissions from your Moxii API and adds them to the token
 */
export default async function (event: onUserTokenGeneratedEvent) {
  const { context } = event;
  const userId = context.user.id;

  console.log(`[Moxii] Generating custom token claims for user: ${userId}`);

  // Get access to the access token to set custom claims
  const accessToken = accessTokenCustomClaims<{
    roles: string[];
    permissions: string[];
    userId?: string;
    organizationId?: string;
    plan?: string;
  }>();

  try {
    // Get API configuration from environment variables
    const apiBaseUrl = getEnvironmentVariable("MOXII_API_BASE_URL").value;
    const apiKey = getEnvironmentVariable("MOXII_KINDE_WORKFLOW_API_KEY").value;

    if (!apiBaseUrl || !apiKey) {
      console.error(
        "[Moxii] Missing API configuration. Please set MOXII_API_BASE_URL and MOXII_KINDE_WORKFLOW_API_KEY in Kinde environment variables",
      );

      // Set default claims on error
      accessToken.roles = ["user"];
      accessToken.permissions = [];
      return;
    }

    console.log(`[Moxii] Fetching roles and permissions for user: ${userId}`);

    // Fetch user roles and permissions from your API
    const claims = await fetch<{
      roles: string[];
      permissions: string[];
      userId?: string;
      organizationId?: string;
      plan?: string;
    }>(`${apiBaseUrl}/users/${userId}/claims`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      responseFormat: "json",
    });

    console.log(`[Moxii] Retrieved claims for user:`, claims);

    // Add custom claims to the token
    if (claims.roles && Array.isArray(claims.roles)) {
      accessToken.roles = claims.roles;
    } else {
      accessToken.roles = ["user"];
    }

    if (claims.permissions && Array.isArray(claims.permissions)) {
      accessToken.permissions = claims.permissions;
    } else {
      accessToken.permissions = [];
    }

    // Add any additional custom claims from your API response
    if (claims.userId) {
      accessToken.userId = claims.userId;
    }

    if (claims.organizationId) {
      accessToken.organizationId = claims.organizationId;
    }

    if (claims.plan) {
      accessToken.plan = claims.plan;
    }

    console.log(`[Moxii] Custom claims added to token successfully`);
  } catch (error) {
    console.error("[Moxii] Error in custom token claims workflow:", error);

    // Ensure at least basic claims are set
    accessToken.roles = ["user"];
    accessToken.permissions = [];
  }
}

import {
  WorkflowSettings,
  WorkflowTrigger,
  onPostAuthenticationEvent,
  getEnvironmentVariable,
  fetch,
} from "@kinde/infrastructure";

export const workflowSettings: WorkflowSettings = {
  id: "postUserAuthentication",
  name: "Post User Authentication - Create User in Moxii DB",
  trigger: WorkflowTrigger.PostAuthentication,
  bindings: {
    "kinde.fetch": {},
    "kinde.env": {},
  },
};

/**
 * Post User Authentication Workflow
 * This workflow runs after a user successfully authenticates with Kinde
 * It creates the user in your local Moxii database
 */
export default async function (event: onPostAuthenticationEvent) {
  const userId = event.context.user.id;
  const isNewKindeUser = event.context.auth.isNewUserRecordCreated;

  console.log(
    `[Moxii] Post-authentication workflow triggered for user: ${userId}`,
  );

  if (!isNewKindeUser) {
    return;
  }

  try {
    // Get API configuration from environment variables
    const apiBaseUrl = getEnvironmentVariable("MOXII_API_BASE_URL").value;
    const apiKey = getEnvironmentVariable("MOXII_API_KEY").value;

    if (!apiBaseUrl || !apiKey) {
      console.error(
        "[Moxii] Missing API configuration. Please set MOXII_API_BASE_URL and MOXII_API_KEY in Kinde environment variables",
      );
      return;
    }

    // Prepare user data payload
    const payload = {
      kindeUserId: userId,
      isNewUser: event.context.auth.isNewUserRecordCreated,
      orgCode: event.request.authUrlParams.orgCode
    };

    console.log(`[Moxii] Creating user in database:`, payload);

    // Make API call to create user in your local database
    const response = await fetch<{ success: boolean; user: any }>(
      `${apiBaseUrl}/users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: new URLSearchParams({
          data: JSON.stringify(payload),
        }),
        responseFormat: "json",
      },
    );

    console.log(`[Moxii] User created successfully:`, response);
  } catch (error) {
    console.error("[Moxii] Error in post-authentication workflow:", error);
  }
}

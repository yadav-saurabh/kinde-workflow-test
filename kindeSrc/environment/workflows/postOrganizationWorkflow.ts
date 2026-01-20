/**
 * Kinde Organization Lifecycle Workflow
 *
 * This workflow will run when organizations are created or updated in Kinde.
 * It creates/updates corresponding tenants in the Moxii entity-service.
 *
 * Flow:
 * 1. Organization created in Kinde → Creates tenant in Moxii
 * 2. Organization updated in Kinde → Updates tenant in Moxii
 * 
 */

import {
  WorkflowSettings,
  WorkflowTrigger,
  onOrganizationCreatedEvent,
  onOrganizationUpdatedEvent,
  getEnvironmentVariable,
  fetch,
} from "@kinde/infrastructure";

export const workflowSettings: WorkflowSettings = {
  id: "organizationLifecycle",
  name: "Organization Lifecycle - Sync Tenants with Moxii",
  trigger: [
    WorkflowTrigger.OrganizationCreated,
    WorkflowTrigger.OrganizationUpdated,
  ],
  bindings: {
    "kinde.fetch": {},
    "kinde.env": {},
  },
};

/**
 * Main workflow function
 */
export default async function (
  event: onOrganizationCreatedEvent | onOrganizationUpdatedEvent
) {
  const orgId = event.context.organization.id;
  const orgCode = event.context.organization.code;
  const orgName = event.context.organization.name;
  const isCreated = event.type === "organization.created";

  console.log(`[Moxii] Organization ${isCreated ? "created" : "updated"}:`, {
    orgId,
    orgCode,
    orgName,
  });

  try {
    // Get API configuration from Kinde environment variables
    const apiBaseUrl = getEnvironmentVariable("MOXII_API_BASE_URL").value;
    const apiKey = getEnvironmentVariable("MOXII_KINDE_WORKFLOW_API_KEY").value;

    if (!apiBaseUrl || !apiKey) {
      console.error(
        "[Moxii] Missing API configuration. Set MOXII_API_BASE_URL and MOXII_KINDE_WORKFLOW_API_KEY in Kinde env vars"
      );
      throw new Error("Missing API configuration");
    }

    if (isCreated) {
      await createTenant(apiBaseUrl, apiKey, orgId, orgCode, orgName);
    } else {
      await updateTenant(apiBaseUrl, apiKey, orgId, orgCode, orgName);
    }
  } catch (error) {
    console.error("[Moxii] Error in organization workflow:", error);
    throw error; // Throw to prevent organization creation if tenant creation fails
  }
}

/**
 * Create tenant in entity-service
 */
async function createTenant(
  apiBaseUrl: string,
  apiKey: string,
  kindeOrgId: string,
  orgCode: string,
  orgName: string
) {
  console.log(`[Moxii] Creating tenant:`, { kindeOrgId, orgCode, orgName });

  const payload = {
    name: orgName,
    slug: orgCode,
    externalId: kindeOrgId,
    status: "active",
  };

  try {
    const response = await fetch(`${apiBaseUrl}/entities/tenants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
      responseFormat: "json",
    });

    console.log(`[Moxii] Tenant created:`, response);
    return response;
  } catch (error) {
    console.error("[Moxii] Failed to create tenant:", error);
    throw error;
  }
}

/**
 * Update tenant in entity-service
 */
async function updateTenant(
  apiBaseUrl: string,
  apiKey: string,
  kindeOrgId: string,
  orgCode: string,
  orgName: string
) {
  console.log(`[Moxii] Updating tenant:`, { kindeOrgId, orgCode, orgName });

  try {
    // First, get the tenant by external ID
    const tenant = await fetch<{ id: string }>(
      `${apiBaseUrl}/entities/tenants/external/${kindeOrgId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        responseFormat: "json",
      }
    );

    if (!tenant || !tenant.id) {
      console.warn(`[Moxii] Tenant not found for org ${kindeOrgId}, creating new one`);
      return await createTenant(apiBaseUrl, apiKey, kindeOrgId, orgCode, orgName);
    }

    // Update the tenant
    const payload = {
      name: orgName,
      slug: orgCode,
    };

    const response = await fetch(`${apiBaseUrl}/entities/tenants/${tenant.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
      responseFormat: "json",
    });

    console.log(`[Moxii] Tenant updated:`, response);
    return response;
  } catch (error) {
    console.error("[Moxii] Failed to update tenant:", error);
    throw error;
  }
}

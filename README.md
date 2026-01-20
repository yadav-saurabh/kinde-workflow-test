# Moxii Kinde Workflow

This repository contains Kinde workflows and custom authentication pages for the Moxii platform.

## Features

### Workflows

- **Post User Authentication**: Automatically creates users in your Moxii database when they sign up via Kinde
- **Custom JWT Claims**: Enriches JWT tokens with roles, permissions, and other custom data from your Moxii API
- **Organization Lifecycle**: Syncs Kinde organizations with Moxii tenants (create/update)

### Custom Pages

- Mobile-optimized authentication pages matching Moxii's brand design
- Phone OTP and Email OTP verification flows
- Consistent color scheme with mobile app (Purple #A64BFF)

## Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd moxii-kinde-workflow
npm install
```

### 2. Configure Environment Variables in Kinde

Go to your Kinde dashboard:

1. Navigate to **Settings > Environment > Environment variables**
2. Add the following environment variables:

```
MOXII_API_BASE_URL=https://api.moxii.com/api
MOXII_KINDE_WORKFLOW_API_KEY=your_moxii_api_key_here
```

### 3. Connect Repository to Kinde

1. Go to **Settings > Environment > Workflows**
2. Connect this Git repository
3. Select your branch (usually `main`)
4. Kinde will automatically deploy your workflows

### 4. Enable Workflows in Kinde Dashboard

1. Navigate to **Settings > Environment > Workflows**
2. Enable the workflows:
   - **Post User Authentication**: Enable to create users in your DB
   - **Custom Token Claims**: Enable to add roles/permissions to JWT

## Workflows

### 1. Organization Lifecycle

**File**: `kindeSrc/environment/workflows/postOrganizationWorkflow.ts`

Runs when organizations are created or updated in Kinde. Creates/updates corresponding tenants in Moxii.

**API Endpoints**:

- `POST {MOXII_API_BASE_URL}/tenants` - Create tenant
- `GET {MOXII_API_BASE_URL}/tenants/external/{kindeOrgId}` - Get tenant by external ID
- `PUT {MOXII_API_BASE_URL}/tenants/{tenantId}` - Update tenant

**Error Handling**: Throws error to prevent organization creation if tenant creation fails.

### 2. Post User Authentication

**File**: `kindeSrc/environment/workflows/postUserAuthenticationWorkflow.ts`

Runs after a user successfully authenticates with Kinde. Creates users in your Moxii database.

**API Endpoints**:

- `POST {MOXII_API_BASE_URL}/entities/staff` - Create staff user
- `POST {MOXII_API_BASE_URL}/customers/customers` - Create customer user

**Error Handling**: Throws error to prevent user creation in Kinde if backend fails.

### 3. Custom Token Claims

**File**: `kindeSrc/environment/workflows/customTokenClaimsWorkflow.ts`

Runs when Kinde generates JWT tokens. Fetches user roles and permissions from your Moxii API.

**API Endpoints**:

- `POST {MOXII_API_BASE_URL}/entities/auth/claims` - Get staff claims
- `POST {MOXII_API_BASE_URL}/customers/customers/auth/claims` - Get customer claims

**Error Handling**: Throws error to prevent token generation if claims cannot be retrieved (shows error instead of giving access).

**Expected Response**:

```json
{
  "roles": ["user", "admin"],
  "permissions": ["read:profile", "write:profile", "read:data"],
  "userId": "your-internal-user-id",
  "organizationId": "org-123",
  "plan": "premium"
}
```

**Custom Claims Added to JWT**:

- `roles`: Array of user roles
- `permissions`: Array of user permissions
- `userId`: Your internal user ID (optional)
- `organizationId`: User's organization (optional)
- `plan`: User's subscription plan (optional)

## Required API Endpoints

Your Moxii API server must implement these endpoints:

### 1. Tenant Management

```
POST /entities/tenants
Headers:
  Content-Type: application/json
  x-api-key: {MOXII_KINDE_WORKFLOW_API_KEY}
Body:
{
  "name": "string",
  "slug": "string",
  "externalId": "string",
  "status": "active"
}

GET /entities/tenants/external/{externalId}
Headers:
  Content-Type: application/json
  x-api-key: {MOXII_KINDE_WORKFLOW_API_KEY}

PUT /entities/tenants/{tenantId}
Headers:
  Content-Type: application/json
  x-api-key: {MOXII_KINDE_WORKFLOW_API_KEY}
Body:
{
  "name": "string",
  "slug": "string"
}
```

### 2. User Creation

```
POST /entities/staff
Headers:
  Content-Type: application/json
  x-api-key: {MOXII_KINDE_WORKFLOW_API_KEY}
Body:
{
  "kindeUserId": "string",
  "orgCode": "string"
}

POST /customers/customers
Headers:
  Content-Type: application/json
  x-api-key: {MOXII_KINDE_WORKFLOW_API_KEY}
Body:
{
  "kindeUserId": "string",
  "orgCode": "string"
}
```

### 3. Auth Claims

```
POST /entities/auth/claims
Headers:
  Content-Type: application/json
  x-api-key: {MOXII_KINDE_WORKFLOW_API_KEY}
Body:
{
  "kindeUserId": "string",
  "orgCode": "string"
}
Response:
{
  "userId": "string",
  "userType": "STAFF",
  "tenantId": "string",
  "tenantCode": "string",
  "roleCode": "string",
  "permissions": ["string"]
}

POST /customers/customers/auth/claims
Headers:
  Content-Type: application/json
  x-api-key: {MOXII_KINDE_WORKFLOW_API_KEY}
Body:
{
  "kindeUserId": "string",
  "orgCode": "string"
}
Response:
{
  "userId": "string",
  "userType": "CUSTOMER",
  "tenantId": "string",
  "tenantCode": "string",
  "roleCode": "string",
  "customerId": "string",
  "permissions": ["string"]
}
```

## Development

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

## Monitoring

To monitor your workflows:

1. Go to **Settings > Environment > Workflows** in Kinde dashboard
2. Click on **View logs** for each workflow
3. You'll see console.log output with `[Moxii]` prefix

## Troubleshooting

### User not created in database

- Check Kinde workflow logs for errors
- Verify `MOXII_API_BASE_URL` and `MOXII_KINDE_WORKFLOW_API_KEY` are set correctly in Kinde environment variables
- Ensure your API endpoint `/users` is accessible and accepts POST requests
- Check your API server logs for errors
- Verify the `x-api-key` header is being validated correctly

### Custom claims not appearing in JWT

- Check Kinde workflow logs for errors
- Verify the `/users/{kindeUserId}/claims` endpoint returns the correct JSON format
- Ensure the workflow is enabled in Kinde dashboard
- Check that the API returns valid JSON with `roles` and `permissions` arrays
- Verify the endpoint is accessible and authentication is working

### Missing environment variables

If you see "Missing API configuration" in logs:

- Verify environment variables are set in Kinde dashboard under **Settings > Environment > Environment variables**
- Ensure variable names match exactly: `MOXII_API_BASE_URL` and `MOXII_KINDE_WORKFLOW_API_KEY`
- Mark the `MOXII_KINDE_WORKFLOW_API_KEY` as a secret in Kinde dashboard
- Redeploy workflows after adding environment variables

### Workflow files not appearing in Kinde

- Ensure workflow files end with `Workflow.ts` (e.g., `postUserAuthenticationWorkflow.ts`)
- Check that files are in the `kindeSrc/environment/workflows/` directory
- Verify the repository is connected and synced in Kinde
- Make sure you've committed and pushed your changes

## How It Works

### Kinde Infrastructure

This project uses the `@kinde/infrastructure` package which provides:

- **Workflow triggers**: Define when workflows run (e.g., post-authentication, token generation)
- **Bindings**: Access to resources like console logging, fetch API, and environment variables
- **Helper functions**: `getEnvironmentVariable()`, `fetch()`, `accessTokenCustomClaims()`

### Workflow Settings

Each workflow exports a `workflowSettings` object that defines:

- **id**: Unique identifier for the workflow
- **name**: Friendly name displayed in Kinde dashboard
- **trigger**: When the workflow should run
- **bindings**: Which Kinde resources the workflow needs access to

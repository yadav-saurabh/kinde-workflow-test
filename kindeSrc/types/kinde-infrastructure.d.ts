declare module "@kinde/infrastructure" {
  export type WorkflowSettings = {
    id: string;
    name?: string;
    trigger: WorkflowTrigger | WorkflowTrigger[];
    bindings?: Record<string, Record<string, never>>;
    failurePolicy?: {
      action: "stop" | "continue";
    };
  };

  export interface KindeFetchOptions extends RequestInit {
    body?: BodyInit | Record<string, unknown> | null;
    responseFormat?: "json" | "text" | "blob";
  }

  export function fetch<TResponse = unknown>(
    url: string | URLSearchParams,
    options?: KindeFetchOptions
  ): Promise<TResponse>;

  export type KindePageEvent = {
    context: {
      widget: {
        content: {
          pageTitle: string;
          heading: string;
          description?: string;
        };
      };
    };
    request: {
      locale: {
        lang: string;
        isRtl: boolean;
      };
    };
  };

  export function getKindeWidget(): Promise<JSX.Element> | JSX.Element;

  export enum WorkflowTrigger {
    PostAuthentication = "user:post_authentication",
    UserTokenGeneration = "user:tokens_generation",
    OrganizationCreated = "organization:created",
    OrganizationUpdated = "organization:updated",
  }

  export type onPostAuthenticationEvent = {
    request: {
      authUrlParams?: {
        orgCode?: string;
      };
    };
    context: {
      auth: {
        isNewUserRecordCreated: boolean;
      };
      user: {
        id: string;
      };
      application?: {
        clientId?: string;
      };
    };
  };

  export type onUserTokenGeneratedEvent = {
    request: {
      auth?: {
        audience?: string[];
      };
    };
    context: {
      user: {
        id: string;
      };
      organization?: {
        code?: string;
      };
      application?: {
        clientId?: string;
      };
    };
  };

  export type KindeEnvironmentVariable = {
    value: string;
  };

  export function getEnvironmentVariable(
    key: string
  ): KindeEnvironmentVariable;

  export function accessTokenCustomClaims<TClaims>(): TClaims;
  export function idTokenCustomClaims<TClaims>(): TClaims;

  export type onOrganizationCreatedEvent = {
    type: "organization.created";
    context: {
      organization: {
        id: string;
        code: string;
        name: string;
      };
    };
  };

  export type onOrganizationUpdatedEvent = {
    type: "organization.updated";
    context: {
      organization: {
        id: string;
        code: string;
        name: string;
      };
    };
  };
}

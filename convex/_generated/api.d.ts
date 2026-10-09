/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as MacalyGoogle from "../MacalyGoogle.js";
import type * as ResendOTP from "../ResendOTP.js";
import type * as auth from "../auth.js";
import type * as authUsers from "../authUsers.js";
import type * as authz from "../authz.js";
import type * as clientRequests from "../clientRequests.js";
import type * as contacts from "../contacts.js";
import type * as discovery from "../discovery.js";
import type * as googleAuth from "../googleAuth.js";
import type * as http from "../http.js";
import type * as intelligence from "../intelligence.js";
import type * as leads from "../leads.js";
import type * as macaly from "../macaly.js";
import type * as operations from "../operations.js";
import type * as sources from "../sources.js";
import type * as staff from "../staff.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  MacalyGoogle: typeof MacalyGoogle;
  ResendOTP: typeof ResendOTP;
  auth: typeof auth;
  authUsers: typeof authUsers;
  authz: typeof authz;
  clientRequests: typeof clientRequests;
  contacts: typeof contacts;
  discovery: typeof discovery;
  googleAuth: typeof googleAuth;
  http: typeof http;
  intelligence: typeof intelligence;
  leads: typeof leads;
  macaly: typeof macaly;
  operations: typeof operations;
  sources: typeof sources;
  staff: typeof staff;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

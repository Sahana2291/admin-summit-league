/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as accounts from "../accounts.js";
import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as broker from "../broker.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as leagues from "../leagues.js";
import type * as mt5 from "../mt5.js";
import type * as payments from "../payments.js";
import type * as snapshots from "../snapshots.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  accounts: typeof accounts;
  admin: typeof admin;
  auth: typeof auth;
  broker: typeof broker;
  crons: typeof crons;
  http: typeof http;
  leagues: typeof leagues;
  mt5: typeof mt5;
  payments: typeof payments;
  snapshots: typeof snapshots;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

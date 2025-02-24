/**
 * Copyright (c) 2025 Maurice Moore
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import * as vscode from 'vscode';

export type QCfg = {
    host: string;
    port: number;
    user: string;
    password: string;     // We'll parse tenant|client|scope out of this
    socketNoDelay: boolean;
    socketTimeout: number;
    label: string;
    tags: string;
    uniqLabel: string;
    useCustomizedAuth: boolean;
};

// A prefix for storing the original "tenant|client|scope" string
const SECRET_KEY_PREFIX = "qAuthParams:";

// Helper: Check if a string "looks like" <tenant>|<client>|<scope>
function isTenantClientScope(str: string): boolean {
    return str.split('|').length >= 3;
}

export function activate(context: vscode.ExtensionContext) {
  const secretStorage = context.secrets;

  let api = {
    async auth(qcfg: QCfg) {
      try {
        // 1. Check if qcfg.password is still in the "tenant|client|scope" format
        //    or if it's already an OAuth token from a previous session.
        let storedParams: string | undefined;

        if (isTenantClientScope(qcfg.password)) {
          // This likely means the user just entered <tenant>|<client>|<scope> in the config.
          // Save it in secret storage so we don't lose it when the main extension overwrites password.
          await secretStorage.store(SECRET_KEY_PREFIX + qcfg.uniqLabel, qcfg.password);
          storedParams = qcfg.password;
        } else {
          // If it doesn't look like tenant|client|scope, we may already have an OAuth token
          // in qcfg.password. Retrieve the original from SecretStorage if present.
          storedParams = await secretStorage.get(SECRET_KEY_PREFIX + qcfg.uniqLabel);
          if (!storedParams) {
            throw new Error(`No stored OAuth params found for '${qcfg.uniqLabel}'. 
              Please re-enter <tenant>|<client>|<scope> in 'password' 
              or remove this entry so it resets.`);
          }
        }

        // 2. Parse out <tenantId>, <clientId>, <resourceScope> from the stored params
        const parts = storedParams.split('|');
        if (parts.length < 3) {
          throw new Error("Password must be in format: <tenant-id>|<client-id>|<scope>");
        }
        const [tenantId, clientId, resourceScope] = parts;

        // 3. Get an OAuth session from the built-in Microsoft Auth Provider
        //    'offline_access' ensures we get a refresh token so the user doesn't
        //    have to sign in repeatedly.
        const session = await vscode.authentication.getSession(
          'microsoft',
          [
            `VSCODE_CLIENT_ID:${clientId}`,
            `VSCODE_TENANT:${tenantId}`,
            'offline_access',
            resourceScope
          ],
          { createIfNone: true }  // prompt user to sign in if none exist
        );

        if (!session) {
          throw new Error("No Microsoft session returned (user may have cancelled the sign-in).");
        }

        // 4. Replace qcfg.password with the new access token
        //    The main kdb extension will use this token to connect.
        qcfg.password = session.accessToken;

        return qcfg;
      } catch (err) {
        console.error("Microsoft Auth failed:", err);
        throw err;
      }
    },
  };

  return api;
}

export function deactivate() {}

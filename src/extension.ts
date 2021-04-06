import * as vscode from "vscode";
import * as vsls from "vsls";
import { registerActivityLog } from "./activityLog";
import { registerPolicyProvider } from "./policyProvider";

export async function activate(context: vscode.ExtensionContext) {
  const api = (await vsls.getApi())!;

  registerActivityLog(api, context.globalStoragePath);
  registerPolicyProvider(api);
}

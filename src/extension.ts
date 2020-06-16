import * as vscode from "vscode";
import * as vsls from "vsls";

export async function activate(context: vscode.ExtensionContext) {
  const api = (await vsls.getApi())!;

  let policyProvider = new TestPolicyProvider();
  let handler = api.registerPolicyProvider("Strict Policy Provider", policyProvider);

  await vscode.window.showErrorMessage("Hi! This message comes from gatekeeper extension. Close the notification to turn my policies off.");
  handler?.dispose();
}

class TestPolicyProvider implements vsls.PolicyProvider {

  policies: vsls.Policy[] = [
    new GenericPolicy(vsls.SettingKey.AnonymousGuestApproval, "accept"),
    new GenericPolicy(vsls.SettingKey.AllowGuestDebugControl, false),
    new GenericPolicy(vsls.SettingKey.AllowedDomains, [
      "microsoft.com",
      "github.com"
    ]),
  ];
}

class GenericPolicy implements vsls.Policy {

  constructor(settingKey: vsls.SettingKey, value: any, isUserLevel: boolean = false) {
    this.isUserLevel = isUserLevel;
    this.value = value;
    this.settingKey = settingKey;
  }

  isUserLevel: boolean;
  
  value: any;
  
  settingKey: vsls.SettingKey;
}

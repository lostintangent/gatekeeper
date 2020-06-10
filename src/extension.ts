import * as vscode from "vscode";
import * as vsls from "vsls";

export async function activate(context: vscode.ExtensionContext) {

  // This extension takes a hard depedency on
  // Live Share, so it will always be available.
  const api = (await vsls.getApi())!;

  // Wait for any guests to attempt to join
  // a collaboration session, in order to
  // determine if they're allowed in or not.

  let policyProvider = new TestPolicyProvider();
  api.registerPolicyProvider("Test Policy Provider", policyProvider);
}

class TestPolicyProvider implements vsls.PolicyProvider {

  policies: vsls.Policy[] = [
    new GenericPolicy(vsls.SettingKey.AllowGuestDebugControl, false)
  ];
}

class GenericPolicy implements vsls.Policy {

  constructor(settingKey: vsls.SettingKey, value: any, isUserLevel: boolean = true) {
    this.isUserLevel = isUserLevel;
    this.value = value;
    this.settingKey = settingKey;
  }

  isUserLevel: boolean;
  
  value: any;
  
  settingKey: vsls.SettingKey;
}

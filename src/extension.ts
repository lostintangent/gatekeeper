import * as vscode from "vscode";
import * as vsls from "vsls";

export async function activate(context: vscode.ExtensionContext) {
  const api = (await vsls.getApi())!;

  let policyProvider = new TestPolicyProvider();
  api.registerPolicyProvider("Strict Policy Provider", policyProvider);

  // await vscode.window.showErrorMessage("Hi! This message comes from gatekeeper extension. Close the notification to turn my policies off.");
  // handler?.dispose();
}

class TestPolicyProvider implements vsls.PolicyProvider {

  policies: vsls.Policy[] = [
    new GenericPolicy(vsls.PolicyTitle.AnonymousGuestApproval, "reject"),
    new GenericPolicy(vsls.PolicyTitle.ConnectionMode, "direct"),
    new GenericPolicy(vsls.PolicyTitle.AutoShareServers, false),
    new GenericPolicy(vsls.PolicyTitle.ReadOnlyTerminals, true),
    new GenericPolicy(vsls.PolicyTitle.AllowedDomains, [
      "microsoft.com",
      "github.com"
    ]),

    new GenericPolicy(vsls.PolicyTitle.AllowGuestDebugControl, false, true),
    new GenericPolicy(vsls.PolicyTitle.AllowGuestTaskControl, false, true)
  ];
}

class GenericPolicy implements vsls.Policy {

  constructor(policyTitle: vsls.PolicyTitle, value: any, isUserLevel: boolean = false) {
    this.isUserLevel = isUserLevel;
    this.value = value;
    this.policyTitle = policyTitle;
  }

  isUserLevel: boolean;
  
  value: any;
  
  policyTitle: vsls.PolicyTitle;
}

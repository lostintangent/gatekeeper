import * as vscode from "vscode";
import * as vsls from "vsls";

export async function activate(context: vscode.ExtensionContext) {
  const api = (await vsls.getApi())!;

  let policyProvider = new TestPolicyProvider();
  api.registerPolicyProvider("Sample Provider", policyProvider);
}

class TestPolicyProvider implements vsls.PolicyProvider {

  providePolicies(): vsls.Policy[] {
    return [
      new GenericPolicy(vsls.PolicyTitle.AnonymousGuestApproval, "reject"),
      new GenericPolicy(vsls.PolicyTitle.ConnectionMode, "relay"),
      new GenericPolicy(vsls.PolicyTitle.AutoShareServers, false),
      new GenericPolicy(vsls.PolicyTitle.AllowReadWriteTerminals, false),
      new GenericPolicy(vsls.PolicyTitle.AllowedDomains, [
        "microsoft.com",
        "github.com"
      ]),
  
      new GenericPolicy(vsls.PolicyTitle.AllowGuestDebugControl, false, true),
      new GenericPolicy(vsls.PolicyTitle.AllowGuestTaskControl, false, true)
    ];
  }
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

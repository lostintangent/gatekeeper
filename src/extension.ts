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
      new GenericPolicy(vsls.PolicySetting.AnonymousGuestApproval, "reject"),
      new GenericPolicy(vsls.PolicySetting.ConnectionMode, "relay"),
      new GenericPolicy(vsls.PolicySetting.AutoShareServers, false),
      new GenericPolicy(vsls.PolicySetting.AllowReadWriteTerminals, false),
      new GenericPolicy(vsls.PolicySetting.AllowedDomains, [
        "microsoft.com",
        "github.com"
      ]),
  
      new GenericPolicy(vsls.PolicySetting.AllowGuestDebugControl, false, true),
      new GenericPolicy(vsls.PolicySetting.AllowGuestTaskControl, false, true)
    ];
  }
}

class GenericPolicy implements vsls.Policy {

  constructor(policyStting: vsls.PolicySetting, value: any, isEnforced: boolean = false) {
    this.isEnforced = isEnforced;
    this.value = value;
    this.policySetting = policyStting;
  }

  isEnforced: boolean;
  
  value: any;
  
  policySetting: vsls.PolicySetting;
}

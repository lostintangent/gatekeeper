import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import * as vsls from "vsls";
import ActivityLog from "./activityLog";

const EXTENSION_NAME = "gatekeeper";
const POLICY_FILE = "liveshare-policy.json";
const POLICY_PROVIDER_NAME = "Gatekeeper Provider";

let policyProviderHandler: vscode.Disposable | null;
let policyProvider: vsls.PolicyProvider;

export async function activate(context: vscode.ExtensionContext) {
  // This extension takes a hard dependency on
  // Live Share, so it will always be available.
  const api = (await vsls.getApi())!;

  policyProvider = new GatekeeperPolicyProvider();
  policyProviderHandler = await api.registerPolicyProvider(
    POLICY_PROVIDER_NAME,
    policyProvider
  );

  vscode.workspace.onDidChangeConfiguration((event) =>
    configurationChangeHandler(api, event)
  );

  const activityLog = new ActivityLog();
  await activityLog.openAsync();
  if (api.onActivity) {
    api.onActivity(activityLog.log.bind(activityLog));
  }
}

async function configurationChangeHandler(
  api: vsls.LiveShare,
  event: vscode.ConfigurationChangeEvent
) {
  if (
    event.affectsConfiguration(
      `${EXTENSION_NAME}.${vsls.PolicySetting.AllowedDomains}`
    ) ||
    event.affectsConfiguration(
      `${EXTENSION_NAME}.${vsls.PolicySetting.AllowReadWriteTerminals}`
    )
  ) {
    // Re-register policy provider
    // to set new setting values
    policyProviderHandler?.dispose();
    policyProviderHandler = await api.registerPolicyProvider(
      POLICY_PROVIDER_NAME,
      policyProvider
    );
  }
}

class GatekeeperPolicyProvider implements vsls.PolicyProvider {
  providePolicies(): vsls.Policy[] {
    return [
      new GenericPolicy(vsls.PolicySetting.AnonymousGuestApproval, "reject"),
      new GenericPolicy(vsls.PolicySetting.ConnectionMode, "relay"),
      new GenericPolicy(vsls.PolicySetting.AutoShareServers, false),
      new GenericPolicy(
        vsls.PolicySetting.AllowReadWriteTerminals,
        vscode.workspace
          .getConfiguration(EXTENSION_NAME)
          .get("allowReadWriteTerminals", false)
      ),
      new GenericPolicy(
        vsls.PolicySetting.AllowedDomains,
        this.getAllowedDomains()
      ),
      new GenericPolicy(vsls.PolicySetting.AllowGuestDebugControl, false, true),
      new GenericPolicy(vsls.PolicySetting.AllowGuestTaskControl, false, true),
    ];
  }

  getAllowedDomains(): string[] {
    // Attempt to read the list of allowed domains
    // from the central policy file (if it exists).
    const filePath = path.join(os.homedir(), POLICY_FILE);
    if (fs.existsSync(filePath)) {
      const contents = fs.readFileSync(filePath, "utf8");

      try {
        const policy = JSON.parse(contents);
        if (policy.allowedDomains) {
          return policy.allowedDomains;
        }
      } catch {
        // The policy file wasn't valid JSON
        // and so silently move on.
      }
    }

    return vscode.workspace
      .getConfiguration(EXTENSION_NAME)
      .get("allowedDomains", []);
  }
}

class GenericPolicy implements vsls.Policy {
  constructor(
    policyStting: vsls.PolicySetting,
    value: any,
    isEnforced: boolean = false
  ) {
    this.isEnforced = isEnforced;
    this.value = value;
    this.policySetting = policyStting;
  }

  isEnforced: boolean;

  value: any;

  policySetting: vsls.PolicySetting;
}

import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import * as vsls from "vsls";
import fetch from "node-fetch";
import { onPropertyChanged } from "./utils";

const EXTENSION_NAME = "gatekeeper";

const POLICY_FILE_ENV_VAR = "LIVESHARE_POLICY_FILE";
const POLICY_FILE = "liveshare-policy.json";
const POLICY_PROVIDER_NAME = "Gatekeeper";

interface PolicyConfig {
  allowedDomains: string[];
  connectionMode: string;
}

function createPolicy(
  policySetting: vsls.PolicySetting,
  value: any,
  isEnforced: boolean = true
) {
  return {
    policySetting,
    value,
    isEnforced,
  };
}

class GatekeeperPolicyProvider implements vsls.PolicyProvider {
  constructor(private api: vsls.LiveShare, private config: PolicyConfig) {}

  providePolicies(): vsls.Policy[] {
    const policies = [
      createPolicy(vsls.PolicySetting.AnonymousGuestApproval, "reject"),
      createPolicy(vsls.PolicySetting.AutoShareServers, false),
      createPolicy(vsls.PolicySetting.AllowedDomains, this.getAllowedDomains()),
      createPolicy(vsls.PolicySetting.AllowGuestDebugControl, false),
      createPolicy(vsls.PolicySetting.AllowGuestTaskControl, false),
    ];

    const mode = this.getConnectionMode();
    if (mode) {
      policies.push(createPolicy(vsls.PolicySetting.ConnectionMode, mode));
    }

    return policies;
  }

  private getAllowedDomains(): string[] {
    if (this.config.allowedDomains) {
      return this.config.allowedDomains;
    }

    const allowedDomains = vscode.workspace
      .getConfiguration(EXTENSION_NAME)
      .get("allowedDomains", []);

    if (allowedDomains.length > 0) {
      return allowedDomains;
    } else if (this.api.session.user && this.api.session.user.emailAddress) {
      const domain = this.api.session.user.emailAddress.split("@")[1];
      return [domain];
    }

    return [];
  }

  private getConnectionMode(): string | undefined {
    return this.config.connectionMode;
  }
}

let policyConfig: PolicyConfig;
async function getPolicyConfig(): Promise<PolicyConfig> {
  if (policyConfig) {
    return policyConfig;
  }

  const filePath =
    process.env[POLICY_FILE_ENV_VAR] || path.join(os.homedir(), POLICY_FILE);

  try {
    if (filePath.startsWith("http")) {
      const response = await fetch(filePath);
      policyConfig = await response.json();
    } else if (fs.existsSync(filePath)) {
      const contents = fs.readFileSync(filePath, "utf8");
      policyConfig = JSON.parse(contents);
    }
  } catch {
    // The config may have been invalid JSON
    // and so we simply ignore it and move on.
  }

  return policyConfig || ({} as PolicyConfig);
}

let policyProviderHandler: vscode.Disposable | null;
let policyProvider: GatekeeperPolicyProvider;

async function refreshPolicies(api: vsls.LiveShare) {
  policyProviderHandler?.dispose();
  policyProviderHandler = await api.registerPolicyProvider!(
    POLICY_PROVIDER_NAME,
    policyProvider
  );
}

export async function registerPolicyProvider(api: vsls.LiveShare) {
  if (api.registerPolicyProvider) {
    // @ts-ignore
    api.session = onPropertyChanged(api.session, "user", () =>
      refreshPolicies(api)
    );

    const config = await getPolicyConfig();
    policyProvider = new GatekeeperPolicyProvider(api, config);
    policyProviderHandler = await api.registerPolicyProvider(
      POLICY_PROVIDER_NAME,
      policyProvider
    );

    vscode.workspace.onDidChangeConfiguration((event) => {
      if (
        event.affectsConfiguration(
          `${EXTENSION_NAME}.${vsls.PolicySetting.AllowedDomains}`
        )
      ) {
        refreshPolicies(api);
      }
    });
  }
}

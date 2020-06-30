import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import * as vsls from "vsls";

const EXTENSION_NAME = "liveshare";
const POLICY_FILE = "liveshare-policy.json";

export async function activate(context: vscode.ExtensionContext) {
  // Ensure the neccessary settings are
  // re-enforced for the end-user.
  await enforceSettings();

  // This extension takes a hard depedency on
  // Live Share, so it will always be available.
  const api = (await vsls.getApi())!;

  // Wait to see if the host attempts to share,
  // and is using a disallowed identity.
  api.onDidChangeSession(async (e) => {
    if (e.session) {
      const allowedDomains = getAllowedDomains();

      if (
        allowedDomains.length > 0 &&
        !allowedDomains.includes(getDomain(api.session)!)
      ) {
        const domains = allowedDomains.sort().join(", ");
        api.end();

        if (
          await vscode.window.showErrorMessage(
            `You need to sign into Live Share using one of the following allowed domains: ${domains}. Please sign-in and share again.`,
            "Sign in"
          )
        ) {
          await reSignIn();
        }
      }
    }
  });

  // Wait for any guests to attempt to join
  // a collaboration session, in order to
  // determine if they're allowed in or not.
  api.onDidChangePeers((e) => {
    e.added.forEach((peer) => {
      // If the current user doesn't have an e-mail address, then
      // there's no point in us trying to match it against guests.
      const selfDomain = getDomain(api.session);
      if (!selfDomain) {
        return;
      }

      // If the incoming user doesn't have an e-mail address,
      // then immediately remove them, since anonymous/unknown
      // guests aren't allowed, regardless of the host's settings.
      const emailDomain = getDomain(peer);
      if (!emailDomain) {
        return removeUser(peer.peerNumber);
      }

      // If the incoming user is from the same domain
      // as the host, then they're immediately allowed.
      if (selfDomain.localeCompare(emailDomain) === 0) {
        return;
      }

      const allowedDomains = getAllowedDomains();

      // If the incoming user is from a different domain,
      // which hasn't been whitelisted, then remove them.
      if (!allowedDomains.includes(emailDomain)) {
        removeUser(peer.peerNumber);
      }
    });
  });
}

const SETTINGS = [
  "allowGuestDebugControl",
  "allowGuestTaskControl",
  "autoShareServers",
];

async function enforceSettings() {
  const config = vscode.workspace.getConfiguration(EXTENSION_NAME);
  return Promise.all(
    SETTINGS.map((setting) =>
      config.update(setting, false, vscode.ConfigurationTarget.Global)
    )
  );
}

function getAllowedDomains(): string[] {
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

function getDomain(peerOrSession: vsls.Peer | vsls.Session) {
  return peerOrSession.user?.emailAddress?.split("@")[1];
}

function removeUser(peerNumber: number) {
  vscode.commands.executeCommand(`${EXTENSION_NAME}.removeParticipant`, {
    sessionId: peerNumber,
  });
}

async function reSignIn() {
  await vscode.commands.executeCommand(`${EXTENSION_NAME}.signout`);
  await vscode.commands.executeCommand(`${EXTENSION_NAME}.signInAndReload`);
}

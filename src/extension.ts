import * as vscode from "vscode";
import * as vsls from "vsls";
import ActivityLog from './activityLog';

const EXTENSION_NAME = "liveshare";
export async function activate(context: vscode.ExtensionContext) {
  // Ensure the neccessary settings are
  // re-enforced for the end-user.
  await enforceSettings();

  // This extension takes a hard depedency on
  // Live Share, so it will always be available.
  const api = (await vsls.getApi())!;

  const activityLog = new ActivityLog();
  await activityLog.openAsync();
  api.onActivity?(activity => activityLog.log(activity));

  // Wait for any guests to attempt to join
  // a collaboration session, in order to
  // determine if they're allowed in or not.
  api.onDidChangePeers((e) => {
    e.added.forEach((peer) => {
      // If the current user doesn't have an e-mail address, then
      // there's no point in us trying to match it against guests.
      const selfDomain = api.session.user?.emailAddress?.split("@")[1];
      if (!selfDomain) {
        return;
      }

      // If the incoming user doesn't have an e-mail address,
      // then immediately remove them, since anonymous/unknown
      // guests aren't allowed, regardless of the host's settings.
      const emailDomain = peer.user?.emailAddress?.split("@")[1];
      if (!emailDomain) {
        return removeUser(peer.peerNumber);
      }

      // If the incoming user is from the same domain
      // as the host, then they're immediately allowed.
      if (selfDomain.localeCompare(emailDomain) === 0) {
        return;
      }

      const allowedDomains: string[] = vscode.workspace
        .getConfiguration(EXTENSION_NAME)
        .get("allowedDomains", []);

      // If the incoming user is from a different domain,
      // which hasn't been whitelisted, then remove them.
      if (!allowedDomains.includes(emailDomain)) {
        removeUser(peer.peerNumber);
      }
    });
  });
}

function removeUser(peerNumber: number) {
  vscode.commands.executeCommand(`${EXTENSION_NAME}.removeParticipant`, {
    sessionId: peerNumber,
  });
}

const SETTINGS = [
  "allowGuestDebugControl",
  "allowGuestTaskControl",
  "autoShareServers"
];

async function enforceSettings() {
  const config = vscode.workspace.getConfiguration(EXTENSION_NAME);
  return Promise.all(
    SETTINGS.map((setting) =>
      config.update(setting, false, vscode.ConfigurationTarget.Global)
    )
  );
}

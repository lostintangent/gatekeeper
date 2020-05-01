import * as vscode from "vscode";
import * as vsls from "vsls";

export async function activate(context: vscode.ExtensionContext) {
  const api = await vsls.getApi();
  api?.onDidChangePeers((e) => {
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

      const allowedDomains: string[] = vscode.workspace
        .getConfiguration("liveshare")
        .get("allowedDomains", []);

      const isSameDomain = selfDomain.localeCompare(emailDomain) !== 0;
      if (!isSameDomain || !allowedDomains.includes(emailDomain)) {
        removeUser(peer.peerNumber);
      }
    });
  });
}

function removeUser(peerNumber: number) {
  vscode.commands.executeCommand("liveshare.removeParticipant", {
    sessionId: peerNumber,
  });
}

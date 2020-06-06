# Live Share Gatekeeper 💂

Live Share Gatekeeper enforces a stricter "mode" of collaboration, for organizations that want the benefits of real-time interaction, while respecting their security/compliance policies. In particular, this extensions allows you to prevent Live Share guests from joining a collaboration session that aren't members of the same domain/AAD tenant. This prevents anonymous users, users outside your organization, or users outside of a specified set of domains (e.g. `microsoft.com`) from being able to collaborating with you, regardless if they got access to the session URL. Additionally, it automatically enforces a set of policies, so that user's can't accidentally share unintended resources (e.g. read/write terminals).

## Getting Started

1. Install the `Live Share Gatekeeper` extension
1. Reload Visual Studio Code
1. Start a Live Share session
1. If a guest tries to join the session, that's either anonymous, or is authenticated with a different domain than you (e.g. `@microsoft.com`), they will be immediately blocked

If needed, you can then easily [automate](#automating-installation) the installation of this extension on every developer's machine in your organization, in order to provide a centrally-managed experience.

## Automating Installation

If your organization is using a systems management solution (e.g. [Microsoft System Center Configuration Manager](https://en.wikipedia.org/wiki/Microsoft_System_Center_Configuration_Manager)), then you can ensure the Gatekeeper extension is automatically installed on developer's machines, by adding the following command to your managed startup scripts:

```shell
code --install-extension vsls-contrib.gatekeeper
```

> If your developers are using VS Code Insiders, then simply adjust the above script to reference `code-insiders` instead of `code`.

This will ensure that developer's always have the latest version of Gatekeeper installed. Additionally, since Gatekeeper takes a dependency on the Live Share extension as well, you can simply install Gatekeeper, which will take care of installing and configuring everything that developer's need to start securely collaborating!

## Enforced Settings

In addition to rejecting anonymous/external guests, this extension also enforces the following settings, by automatically setting them to `false`:

- `Liveshare: Allow Guest Debug Control`
- `Liveshare: Allow Guest Task Control`
- `Liveshare: Auto Share Servers`

> These settings are automatically set to `false` every time the user runs VS Code. However, the user can still set them back to `true` within a VS Code session.

## Contributed Settings

By default, this extension blocks all guests who are authenticated with a different domain than the host. However, if you'd like to expand the scope of allowed domains, you can specify the following setting:

- `Live Share: Allowed Domains` - Specifies the set of domains that guests are allowed be authenticated with. Defaults to `[]` which only allows guests from the same domain as the host.

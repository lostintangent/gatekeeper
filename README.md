# Live Share Gatekeeper 💂

Live Share Gatekeeper enforces a stricter "mode" of collaboration, for organizations that want the benefits of real-time interaction, while respecting their security/compliance policies. In particular, this extensions allow you to prevent Live Share guests from joining a collaboration session that aren't members of the same domain/AAD tenant. This prevents anonymous users, users outside your organization, or users outside of a specified set of domains (e.g. `microsoft.com`) from being able to collaborating with you, regardless if they got access to the session URL. Additionally, it automatically enforces a set of policies, so that user's can't accidentally share unintended resources (e.g. read/write terminals).

## Getting Started

1. Install the `Live Share Gatekeeper` extension
1. Reload Visual Studio Code
1. Start a Live Share session
1. If a guest tries to join the session, that's either anonymous, or is authenticated with a different domain than you (e.g. `@microsoft.com`), they will be immediately blocked
1. _(Optional)_ [Explicitly configure](#configuring-allowed-domains) the set of allowed domains to have even greater control

If needed, you can then easily [automate](#automating-installation) the installation of this extension on every developer's machine in your organization, in order to provide a centrally-managed experience.

## Automating Installation

If your organization is using a systems management solution (e.g. [Microsoft System Center Configuration Manager](https://en.wikipedia.org/wiki/Microsoft_System_Center_Configuration_Manager)), then you can ensure the Gatekeeper extension is automatically installed on developer's machines, by adding the following command to your managed startup scripts:

```shell
code --install-extension vsls-contrib.gatekeeper
```

> If your developers are using VS Code Insiders, then simply adjust the above script to reference `code-insiders` instead of `code`.

This will ensure that developer's always have the latest version of Gatekeeper installed. Additionally, since Gatekeeper takes a dependency on the Live Share extension as well, you can simply install Gatekeeper, which will take care of installing and configuring everything that developer's need to start securely collaborating!

## Configuring Allowed Domains

By default, Gatekeeper restricts collaboration within the same domain that the host is currently signed in with (e.g. `microsoft.com`). However, if your organization wants to prevent developer's from using non-work accounts, and/or authorize the use of a broader set of domains (e.g. to support subsidiaries/"guest" tenants), then you can explicitly configure the set of allowed domains via a config file. This file should be place at `$HOME/liveshare-policy.json` and contains the following schema:

```json
{
  "allowedDomains": ["foo.com", "bar.net"]
}
```

> Alternatively, the set of allowed domains can be configured via the `Live Share > Allowed Domains` VS Code setting. When both sources exist, the contents of the config file will take precedence, which allows for a centrally managed solution.

When a set of allowed domains is configured, then the host is required to authenticate with Live Share using one of those domains. If they aren't, then they will receive the following error when they attempt to share their workspace:

<img width="500px" src="https://user-images.githubusercontent.com/116461/86175551-66493f00-bad8-11ea-9f22-9fe90c478da9.png" />

## Enforced Settings

In addition to rejecting anonymous/external guests, this extension also enforces the following settings, by automatically setting them to `false`:

- `Liveshare: Allow Guest Debug Control`
- `Liveshare: Allow Guest Task Control`
- `Liveshare: Auto Share Servers`

> These settings are automatically set to `false` every time the user runs VS Code. However, the user can still set them back to `true` within a VS Code session.

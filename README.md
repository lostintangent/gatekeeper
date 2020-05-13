# Live Share Gatekeeper 💂

Live Share Gatekeeper enforces a stricter "mode" of collaboration, for organizations that want the benefits of real-time interaction, while respecting their security/compliance policies. In particular, this extensions allows you to prevent Live Share guests from joining a collaboration session that isn't a member of the same domain/AAD tenant. This prevents anonymous users, users outside your organization, or users outside of a specified set of domains (e.g. `microsoft.com`) from being able to collaborating with you, regardless if they got access to the session URL. Additionally, it automatically enforces a set of policies, so that user's can't accidentally share unintended resources (e.g. read/write terminals).

## Getting Started

1. Install this extension
1. Start a Live Share session
1. If a guest tries to join the session, that's either anonymous, or is authenticated with a different domain than you (e.g. `@microsoft.com`), they will be immediately blocked

If you want to allow guests to join from a set of custom domains, then set the `Live Share: Allowed Domains` setting as appropriate.

## Enforced Settings

In addition to rejecting anonymous/external guests, this extension also enforces the following settings, by setting them to `false`:

- `Liveshare: Allow Guest Debug Control`
- `Liveshare: Allow Guest Task Control`
- `Liveshare: Auto Share Servers`

> Note: These settings are automatically set to `false` every time the user runs VS Code. However, the user can still set them back to `true` within a VS Code session.
>
## Contributed Settings

- `Live Share: Allowed Domains` - Specifies the set of domains that guests are allowed be authenticated with. Defaults to `[]` which only allows guests from the same domain as the host.
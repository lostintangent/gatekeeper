# Live Share Bouncer 💂

Live Share Bouncer allows you to prevent Live Share guests from joining a collaboration session that isn't a member of the same domain/AAD tenant. This prevents anonymous users, users outside your organization, or users outside of a specified set of domains (e.g. `microsoft.com`) from being able to collaborating with you, regardless if they got access to the session URL.

## Getting Started

1. Install this extension
1. Start a Live Share session
2. If a guest tries to join the session, that's either anonymous, or is authenticated with a different domain than you (e.g. `@microsoft.com`), they will be immediately blocked

If you want to allow guests to join from a set of custom domains, then set the `Live Share: Allowed Domains` setting as appropriate.

## Contributed Settings

- `Live Share: Allowed Domains` - Specifies the set of domains that guests are allowed be authenticated with. Defaults to `[]` which only allows guests from the same domain as the host.
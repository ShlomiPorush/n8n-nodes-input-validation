# n8n-nodes-input-validation

[![npm version](https://img.shields.io/npm/v/n8n-nodes-input-validation.svg)](https://www.npmjs.com/package/n8n-nodes-input-validation)

Community node for [n8n](https://n8n.io) that validates incoming API/webhook data and routes items to **Valid** or **Invalid** outputs — replacing chains of IF + SET nodes.

## Features

- **Dual outputs** (like IF): **Valid** passes input unchanged; **Invalid** returns a ready-to-use error payload for **Respond to Webhook**
- **Plain-text error**: `error` field with human-readable messages (e.g. for simple API responses)
- **Detailed errors**: `errors` array with `field`, `operation`, `message`, and `received`
- **8 operators**: is empty, is not empty, contains, does not contain, equals, does not equal, greater than, less than
- **Rule groups** with AND/OR inside each group and AND/OR between groups  
  Example: `(body.email AND body.age) OR (query.type = premium OR enterprise)`
- **Field paths** via dot notation: `body.email`, `query.page`, `headers.authorization`

## Install in n8n

### From npm (recommended)

1. Open n8n → **Settings** → **Community nodes**
2. Click **Install**
3. Enter: `n8n-nodes-input-validation`
4. Restart n8n if prompted

### Local development (npm link)

Requires **Node.js 20+** and **npm**.

```bash
git clone https://github.com/ShlomiPorush/n8n-nodes-input-validation.git
cd n8n-nodes-input-validation
npm install
npm run build
npm link
```

In your n8n custom extensions folder (e.g. `~/.n8n/custom`):

```bash
npm link n8n-nodes-input-validation
```

Restart n8n.

## Usage

### Typical API workflow

```
Webhook → Input Validation
            ├─ Valid   → business logic → Respond to Webhook (200)
            └─ Invalid → Respond to Webhook
                           Response Code: {{ $json.statusCode }}
                           Response Body: {{ $json }}
```

For a short text-only response, use `{{ $json.error }}` as the body.

### Invalid output

```json
{
  "valid": false,
  "statusCode": 400,
  "message": "Validation failed",
  "error": "body.email must not be empty; body.age must be greater than 18",
  "errors": [
    {
      "field": "body.email",
      "operation": "isNotEmpty",
      "message": "body.email must not be empty",
      "received": null
    }
  ]
}
```

| Field | Description |
|-------|-------------|
| `message` | Summary (configurable in node options) |
| `error` | All failed conditions as one string, separated by `;` |
| `errors` | Structured list for programmatic handling |
| `statusCode` | Suggested HTTP code (default `400`) |
| `original` | Included only when **Include Original Input** is enabled |

### Node options

| Option | Default | Description |
|--------|---------|-------------|
| Ignore Case | `true` | Case-insensitive string comparisons |
| Error Status Code | `400` | Value in `statusCode` on Invalid output |
| Include Original Input | `false` | Adds `original` with the full input JSON |
| Error Message | `Validation failed` | Value in `message` on Invalid output |

Per-condition **Error Message** overrides the default text for that rule (also reflected in `error` and `errors`).

## Operators

| Operation | Value required | Description |
|-----------|----------------|-------------|
| Is Empty | No | `null`, `undefined`, `""`, or empty array |
| Is Not Empty | No | Opposite of above |
| Contains | Yes | String contains value |
| Does Not Contain | Yes | Opposite |
| Equals | Yes | String comparison |
| Does Not Equal | Yes | Opposite |
| Greater Than | Yes | Numeric comparison |
| Less Than | Yes | Numeric comparison |

## Rule groups example

**Combine Groups:** OR

| Group | Combine Conditions | Conditions |
|-------|-------------------|------------|
| 1 | AND | `body.email` is not empty, `body.age` greater than `18` |
| 2 | OR | `query.type` equals `premium`, `query.type` equals `enterprise` |

Evaluates: `(email ∧ age) ∨ (premium ∨ enterprise)`.

## Development

Lightweight toolchain — **no** full n8n / `@n8n/node-cli` install (avoids native `isolated-vm` builds).

```bash
npm install
npm run build    # tsc + copy icons (build.mjs)
npm test         # vitest
npm run build:watch
```

**Requirements:** Node.js **20+** (`engines` in `package.json`).

**WSL:** Prefer the Linux filesystem (`~/projects/...`) over `/mnt/c/...` if you hit slow builds or path issues.

## Publishing

Pushing a version tag triggers the GitHub Action (`.github/workflows/npm-publish.yml`):

```bash
git tag v1.0.1
git push origin v1.0.1
```

The workflow runs `npm ci`, `npm run build`, `npm test`, and publishes to npm with provenance.

## License

MIT

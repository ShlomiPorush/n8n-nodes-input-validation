# n8n-nodes-input-validation

Community node for [n8n](https://n8n.io) that validates incoming API/webhook data and routes items to **Valid** or **Invalid** outputs — replacing chains of IF + SET nodes.

## Features

- **Dual outputs** (like IF): Valid passes input unchanged; Invalid returns a structured error payload for **Respond to Webhook**
- **8 operators**: is empty, is not empty, contains, does not contain, equals, does not equal, greater than, less than
- **Rule groups** with AND/OR inside each group and AND/OR between groups  
  Example: `(body.email AND body.age) OR (query.type = premium OR enterprise)`
- **Field paths** via dot notation: `body.email`, `query.page`, `headers.authorization`

## Requirements

You need **Node.js 20+** and **npm**. This package uses a lightweight build (`tsc` only) — no full n8n install, so no `isolated-vm` compile step.

```bash
cd n8n-nodes-input-validation
rm -rf node_modules package-lock.json   # if a previous install failed
npm install
npm run build
npm test
```

**WSL tip:** If you previously installed under `/mnt/c/...` and saw `isolated-vm` / `node-gyp` errors, clone or copy the repo to the Linux filesystem (e.g. `~/projects/...`) and use Node 20 from [nvm](https://github.com/nvm-sh/nvm): `nvm install 20 && nvm use 20`.

## Install in n8n

**From npm** (after publish): Settings → Community nodes → Install `n8n-nodes-input-validation`.

**Local link:**

```bash
npm run build
npm link
# in ~/.n8n/custom (or your N8N_CUSTOM_EXTENSIONS path):
npm link n8n-nodes-input-validation
```

Restart n8n.

## Typical API workflow

```
Webhook → Input Validation
            ├─ Valid   → business logic → Respond to Webhook (200)
            └─ Invalid → Respond to Webhook
                           Response Code: {{ $json.statusCode }}
                           Response Body: {{ $json }}
```

### Invalid output shape

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

Use `{{ $json.error }}` in **Respond to Webhook** when you want a plain-text error body (or combine with `message` for a short title + details).

## Operators

| Operation       | Value required | Description                                      |
|-----------------|----------------|--------------------------------------------------|
| Is Empty        | No             | `null`, `undefined`, `""`, or empty array        |
| Is Not Empty    | No             | Opposite of above                                |
| Contains        | Yes            | String contains value (optional ignore case)     |
| Does Not Contain| Yes            | Opposite                                         |
| Equals          | Yes            | String comparison (optional ignore case)         |
| Does Not Equal  | Yes            | Opposite                                         |
| Greater Than    | Yes            | Numeric comparison                               |
| Less Than       | Yes            | Numeric comparison                               |

## Rule groups example

**Combine Groups:** OR

| Group | Combine Conditions | Conditions |
|-------|-------------------|------------|
| 1     | AND               | `body.email` is not empty, `body.age` greater than `18` |
| 2     | OR                | `query.type` equals `premium`, `query.type` equals `enterprise` |

Evaluates: `(email ∧ age) ∨ (premium ∨ enterprise)`.

## License

MIT

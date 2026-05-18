# n8n-nodes-input-validation

Community node for [n8n](https://n8n.io) that validates incoming API/webhook data and routes items to **Valid** or **Invalid** outputs — replacing chains of IF + SET nodes.

## Features

- **Dual outputs** (like IF): Valid passes input unchanged; Invalid returns a structured error payload for **Respond to Webhook**
- **8 operators**: is empty, is not empty, contains, does not contain, equals, does not equal, greater than, less than
- **Rule groups** with AND/OR inside each group and AND/OR between groups  
  Example: `(body.email AND body.age) OR (query.type = premium OR enterprise)`
- **Field paths** via dot notation: `body.email`, `query.page`, `headers.authorization`

## Requirements

You need **Node.js 18+** and **npm** to install dependencies and build. Download from [https://nodejs.org](https://nodejs.org) (npm is included).

```bash
cd n8n-nodes-input-validation
npm install
npm run build
npm test
```

## Install in n8n (local development)

```bash
npm run build
npm link
```

In your n8n custom extensions folder (e.g. `~/.n8n/custom`):

```bash
npm link n8n-nodes-input-validation
```

Or use `npm run dev` to start n8n with hot reload after dependencies are installed.

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

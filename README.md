# n8n-nodes-input-validation

Custom n8n community node for **validating incoming API and webhook data** — parameters, body fields, and headers — and routing the result to **Valid** or **Invalid** outputs.

When you use n8n as an API gateway, every endpoint needs to check that required fields exist and match the expected format. Today that usually means chaining **Webhook → IF → SET → Respond to Webhook** just to return a `400` with a readable error. This package replaces that pattern with a single node.

---

## What does it do?

The **Input Validation** node reads fields from the incoming item (using dot-notation paths like `body.email` or `query.page`), evaluates your rules, and:

- **Valid** — passes the original input through unchanged (continue your workflow)
- **Invalid** — outputs a ready-made error object for **Respond to Webhook** (status code, plain-text `error`, and structured `errors` array)

No credentials required. Works with any trigger that outputs JSON (typically **Webhook**).

### Before vs After

**Without this node:**

```
Webhook → IF (field checks) → SET (build error JSON) → Respond to Webhook
         → IF (else branch)  → your business logic
```

**With this node:**

```
Webhook → Input Validation ─ Valid   → your business logic → Respond 200
                          └ Invalid → Respond to Webhook ({{ $json }})
```

---

## Node in this Package

| Node | Type | Description |
|------|------|-------------|
| **Input Validation** | Transform | Validate fields with rule groups; route to Valid or Invalid |

---

## Installation

### Community Nodes (Recommended)

1. Go to **Settings → Community Nodes** in your n8n instance
2. Click **Install a community node**
3. Enter `n8n-nodes-input-validation`
4. Click **Install** and restart n8n if prompted

### Manual Installation

```bash
cd ~/.n8n/custom   # or your N8N_CUSTOM_EXTENSIONS path
npm install n8n-nodes-input-validation
# Restart n8n
```

---

## Input Validation Node

### Configuration

| Setting | Description |
|---------|-------------|
| **Combine Groups** | `AND` = every group must pass · `OR` = at least one group must pass |
| **Rule Groups** | One or more groups of conditions (see below) |
| **Combine Conditions** (per group) | `AND` = all conditions in the group · `OR` = at least one condition |
| **Field** | Dot-notation path on the incoming JSON, e.g. `body.email`, `query.page`, `headers.x-api-key` |
| **Operation** | See [Operators](#operators) |
| **Value** | Comparison value (not used for empty/boolean-only operations) |
| **Default Value** | When the field is **missing**: skip this condition, and add the default to the **Valid** output JSON |
| **Error Message** | Optional custom text when this condition fails |

### Options

| Option | Default | Description |
|--------|---------|-------------|
| **Ignore Case** | `true` | Case-insensitive string comparisons |
| **Error Status Code** | `400` | HTTP code in the Invalid output (`statusCode`) |
| **Include Original Input** | `false` | Adds `original` with the full input JSON on Invalid |
| **Error Message** | `Validation failed` | Summary text in the Invalid output (`message`) |

### How it works

1. A request hits your workflow (e.g. via **Webhook**)
2. The node reads each configured **Field** from the item JSON
3. Conditions are evaluated inside each **Rule Group**, then groups are combined with **Combine Groups**
4. **All rules pass** → item goes to the **Valid** output (unchanged)
5. **Any rule fails** → item goes to the **Invalid** output with a structured error payload

### Operators

| Operation | Value | Description |
|-----------|-------|-------------|
| **Is Empty** | — | `null`, `undefined`, `""`, or empty array |
| **Is Not Empty** | — | Field must have a value |
| **Contains** | Yes | String contains the value |
| **Does Not Contain** | Yes | String does not contain the value |
| **Equals** | Yes | String equality (respects Ignore Case) |
| **Does Not Equal** | Yes | String inequality |
| **Greater Than** | Yes | Numeric comparison (`body.age` > `18`) |
| **Less Than** | Yes | Numeric comparison |
| **Is True** | — | Value must be `true` (boolean, or `true` / `1` as string) |
| **Is False** | — | Value must be `false` (boolean, or `false` / `0` as string) |
| **Is Boolean** | — | Value must be a valid boolean (`true` or `false`) |

Accepts native booleans and common API string forms: `true`, `false`, `1`, `0` (case-insensitive).

### Rule groups example

Validate that either `(email AND age)` **or** `(premium OR enterprise plan)`:

| Combine Groups | **OR** |
|----------------|--------|
| **Group 1** — Combine Conditions: **AND** | `body.email` · Is Not Empty |
| | `body.age` · Greater Than · `18` |
| **Group 2** — Combine Conditions: **OR** | `query.type` · Equals · `premium` |
| | `query.type` · Equals · `enterprise` |

Logic: `(email ∧ age>18) ∨ (type=premium ∨ type=enterprise)`

---

## Invalid Output

When validation fails, the **Invalid** branch receives:

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
    },
    {
      "field": "body.age",
      "operation": "greaterThan",
      "message": "body.age must be greater than 18",
      "received": "12"
    }
  ]
}
```

| Field | Use |
|-------|-----|
| `statusCode` | Set **Respond to Webhook → Response Code** to `{{ $json.statusCode }}` |
| `error` | Plain-text body — all failures joined with `;` |
| `errors` | Full list for logging or JSON API responses |
| `message` | Short summary line |
| `original` | Present only if **Include Original Input** is enabled |

---

## Examples

### Example: Missing field with default (skip + inject)

| Field | Operation | Default Value |
|-------|-----------|---------------|
| `Test` | Is Empty | `false` |

Input: `{ "ClientName": "Moses" }` — no `Test` field.

- The **Is Empty** condition is **skipped** (field does not exist)
- **Valid** output: `{ "ClientName": "Moses", "Test": false }`

If the client **sends** `Test`, the condition runs normally (Is Empty must pass).

### Example: POST API with required body fields

**Workflow:**

```
Webhook (POST /api/orders)
  → Input Validation
      Valid   → Create Order → Respond to Webhook (200)
      Invalid → Respond to Webhook
                  Response Code: {{ $json.statusCode }}
                  Response Body: {{ $json }}
```

**Rules (single group, AND):**

| Field | Operation | Value |
|-------|-----------|-------|
| `body.customer_id` | Is Not Empty | |
| `body.amount` | Greater Than | `0` |
| `body.currency` | Equals | `USD` |

**Invalid response** (what the client sees if `body.amount` is missing):

```json
{
  "valid": false,
  "statusCode": 400,
  "message": "Validation failed",
  "error": "body.amount must not be empty",
  "errors": [ ... ]
}
```

### Example: Simple text error response

Connect **Invalid** → **Respond to Webhook**:

- **Response Code:** `{{ $json.statusCode }}`
- **Response Body:** `{{ $json.error }}`

Client receives: `body.email must not be empty; body.age must be greater than 18`

### Example: calling the webhook

```bash
curl -X POST https://your-n8n.com/webhook/orders \
  -H "Content-Type: application/json" \
  -d '{"customer_id": "c_1", "amount": 99, "currency": "USD"}'
```

---

## License

MIT

# Notifox GitHub Action

Send alerts to [Notifox](https://notifox.com) from your GitHub Actions workflows—SMS or email to a specific audience with a single step.

## Usage

### Basic

```yaml
- uses: notifoxhq/action@v1
  with:
    audience: ops
    channel: email
    message: "Deploy to production completed successfully"
  env:
    NOTIFOX_API_KEY: ${{ secrets.NOTIFOX_API_KEY }}
```

### With API key as input

```yaml
- uses: notifoxhq/action@v1
  with:
    api_key: ${{ secrets.NOTIFOX_API_KEY }}
    audience: oncall
    channel: sms
    message: "Build failed on ${{ github.ref_name }}"
```

### On failure

```yaml
- name: Deploy
  run: ./deploy.sh
- name: Notify on failure
  if: failure()
  uses: notifoxhq/action@v1
  with:
    audience: ops
    channel: sms
    message: "Deploy failed — check the workflow run"
  env:
    NOTIFOX_API_KEY: ${{ secrets.NOTIFOX_API_KEY }}
```

## Inputs

| Input     | Required | Description |
|----------|----------|-------------|
| `api_key` | No  | Notifox API key. If omitted, `NOTIFOX_API_KEY` env (e.g. from secrets) is used. |
| `audience` | Yes | Audience to send to (e.g. `ops`, `me`, `oncall`). Configure in the [Notifox console](https://api.console.notifox.com). |
| `channel` | Yes | `sms` or `email`. |
| `message` | Yes | Alert body to send. |

## Outputs

| Output       | Description |
|-------------|-------------|
| `message_id` | Set when the API returns a message ID. |

## Setup

1. Create a [Notifox](https://notifox.com) account and an API key in the console.
2. Add a repository secret (e.g. `NOTIFOX_API_KEY`) with that key.
3. Configure audiences and channels (SMS/email) in the Notifox console.

## API

This action calls the [Notifox HTTP API](https://docs.notifox.com): `POST https://api.notifox.com/alert` with Bearer auth and JSON body `{ audience, alert, channel }`.

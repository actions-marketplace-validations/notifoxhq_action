const core = require('@actions/core');
const https = require('https');

const BASE_URL = 'https://api.notifox.com';

async function sendAlert(apiKey, audience, channel, message) {
  const url = new URL('/alert', BASE_URL);
  const body = JSON.stringify({
    audience,
    alert: message,
    channel: channel.toLowerCase(),
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(data ? JSON.parse(data) : {});
            } catch {
              resolve({});
            }
          } else {
            let errMsg = data;
            try {
              const parsed = JSON.parse(data);
              errMsg = parsed.description || parsed.error || data;
            } catch {}
            reject(new Error(`Notifox API error (${res.statusCode}): ${errMsg}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  try {
    const apiKey = core.getInput('api_key') || process.env.NOTIFOX_API_KEY;
    if (!apiKey) {
      core.setFailed('Notifox API key is required. Set api_key input or NOTIFOX_API_KEY secret.');
      return;
    }

    const audience = core.getInput('audience', { required: true });
    const channel = core.getInput('channel', { required: true });
    const message = core.getInput('message', { required: true });

    const validChannels = ['sms', 'email'];
    const channelLower = channel.toLowerCase();
    if (!validChannels.includes(channelLower)) {
      core.setFailed(`channel must be one of: ${validChannels.join(', ')}`);
      return;
    }

    const result = await sendAlert(apiKey, audience, channelLower, message);
    if (result.message_id) {
      core.setOutput('message_id', result.message_id);
    }
    core.info('Notifox alert sent successfully.');
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();

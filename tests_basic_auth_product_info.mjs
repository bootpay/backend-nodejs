/**
 * Commerce Basic Auth smoke test — fetch 로 /products 한 번 호출하고 응답 확인.
 *
 * 키는 반드시 .env 또는 환경변수로 주입한다 (.env.example 참고).
 *   - BOOTPAY_ENV=production|development|stage
 *   - BOOTPAY_COMMERCE_CLIENT_KEY_{PROD|DEV}
 *   - BOOTPAY_COMMERCE_SECRET_KEY_{PROD|DEV}
 */
import { Buffer } from 'node:buffer';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadDotEnv() {
  for (const file of [resolve(__dirname, '.env'), resolve(__dirname, 'test', '.env')]) {
    if (!existsSync(file)) continue;
    for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#') || !line.includes('=')) continue;
      const idx = line.indexOf('=');
      const key = line.slice(0, idx).trim();
      let value = line.slice(idx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }
}

loadDotEnv();

const env = (process.env.BOOTPAY_ENV || 'production').toLowerCase();
const baseUrlMap = {
  production: 'https://api.bootapi.com/v1',
  stage: 'https://stage-api.bootapi.com/v1',
  development: 'https://dev-api.bootapi.com/v1'
};
const baseUrl = baseUrlMap[env] || baseUrlMap.production;

const suffix = env === 'production' ? 'PROD' : 'DEV';
const clientKey = process.env[`BOOTPAY_COMMERCE_CLIENT_KEY_${suffix}`] || '';
const secretKey = process.env[`BOOTPAY_COMMERCE_SECRET_KEY_${suffix}`] || '';

if (!clientKey || !secretKey) {
  console.error(`[smoke] missing BOOTPAY_COMMERCE_CLIENT_KEY_${suffix} / BOOTPAY_COMMERCE_SECRET_KEY_${suffix} — set them in .env (see .env.example)`);
  process.exit(2);
}

const basic = Buffer.from(`${clientKey}:${secretKey}`).toString('base64');
const res = await fetch(`${baseUrl}/products?page=1&limit=1`, {
  headers: {
    'Authorization': `Basic ${basic}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'bootpay_api_version': '5.0.0',
    'bootpay_sdk_version': '5.0.0',
    'bootpay_sdk_type': '300'
  }
});

const body = await res.text();
console.log(JSON.stringify({ env, status: res.status, ok: res.ok, preview: body.slice(0, 500) }, null, 2));
if (!res.ok) process.exit(1);

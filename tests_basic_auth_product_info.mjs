import { Buffer } from 'node:buffer';

const clientKey = process.env.BP_CLIENT_KEY || 'QIzXk4M3EeD-6B1GTfmGHA';
const secretKey = process.env.BP_SECRET_KEY || 'vRle44QfyBj7nzJlBbeebqkbtlJVRTS2DQa9Adpz3d8=';
const baseUrl = process.env.BP_BASE_URL || 'https://dev-api.bootapi.com/v1';

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
console.log(JSON.stringify({ status: res.status, ok: res.ok, preview: body.slice(0, 500) }, null, 2));
if (!res.ok) process.exit(1);

import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import worker from './src/index.js';

let sent;
let allowed;
const env = { RESEND_API_KEY: 'test', LIMITER: { limit: async () => ({ success: allowed }) } };
const post = (body) =>
    worker.fetch(new Request('https://worker.test', { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body) }), env);
const valid = { name: 'Ada', email: 'ada@example.com', message: 'Hello' };

beforeEach(() => {
    sent = [];
    allowed = true;
    globalThis.fetch = async (url, init) => {
        sent.push(JSON.parse(init.body));
        return new Response('{}', { status: 200 });
    };
});

test('valid body sends one email', async () => {
    assert.equal((await post(valid)).status, 200);
    assert.equal(sent.length, 1);
    assert.equal(sent[0].reply_to, 'ada@example.com');
});

test('rejects missing, non-string, too long and bad email without sending', async () => {
    for (const body of [
        { ...valid, name: '' },
        { ...valid, message: { a: 1 } },
        { ...valid, message: 'x'.repeat(5001) },
        { ...valid, email: 'not-an-email' },
        'not json',
    ]) {
        assert.equal((await post(body)).status, 400, JSON.stringify(body));
    }
    assert.equal(sent.length, 0);
});

test('rate-limited visitor gets 429 and nothing is sent', async () => {
    allowed = false;
    assert.equal((await post(valid)).status, 429);
    assert.equal(sent.length, 0);
});

test('missing rate-limit binding gives a CORS-readable 500 and sends nothing', async () => {
    const res = await worker.fetch(new Request('https://worker.test', { method: 'POST', body: JSON.stringify(valid) }), {});
    assert.equal(res.status, 500);
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), '*');
    assert.equal(sent.length, 0);
});

test('GET is not allowed', async () => {
    assert.equal((await worker.fetch(new Request('https://worker.test'), env)).status, 405);
});

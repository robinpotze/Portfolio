const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

const MAX_LENGTH = { name: 200, email: 320, message: 5000 };

const EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const json = (body, status) => new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });

export default {
    async fetch(request, env) {
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: CORS_HEADERS });
        }
        if (request.method !== 'POST') {
            return json({ error: 'Method not allowed' }, 405);
        }

        // Limit per visitor IP (binding in wrangler.toml), so a script can't flood the inbox or the Resend quota.
        const { success } = await env.LIMITER.limit({ key: request.headers.get('CF-Connecting-IP') ?? 'unknown' });
        if (!success) {
            return json({ error: 'Too many requests' }, 429);
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return json({ error: 'Invalid JSON' }, 400);
        }

        const { name, email, message } = body ?? {};
        for (const [field, value] of Object.entries({ name, email, message })) {
            if (typeof value !== 'string' || value.trim() === '' || value.length > MAX_LENGTH[field]) {
                return json({ error: `Invalid ${field}` }, 400);
            }
        }
        if (!EMAIL_REGEX.test(email)) {
            return json({ error: 'Invalid email address' }, 400);
        }

        try {
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: `Contact Form <${env.FROM_EMAIL || 'onboarding@resend.dev'}>`,
                    to: [env.TO_EMAIL || 'contact@robinpotze.com'],
                    subject: `Portfolio contact from ${name}`,
                    reply_to: email,
                    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
                }),
            });

            if (!res.ok) {
                console.error('Resend request failed', res.status, await res.text());
                return json({ error: 'Failed to send email' }, 502);
            }
            return json({ success: true }, 200);
        } catch (err) {
            console.error('Contact form error', err);
            return json({ error: 'Internal server error' }, 500);
        }
    },
};

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
    async fetch(request, env) {
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: CORS_HEADERS });
        }

        if (request.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405,
                headers: {
                    ...CORS_HEADERS,
                    'Content-Type': 'application/json',
                },
            });
        }

        try {
            const { name, email, message } = await request.json();

            if (!name || !email || !message) {
                return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                    status: 400,
                    headers: {
                        ...CORS_HEADERS,
                        'Content-Type': 'application/json',
                    },
                });
            }

            const emailRegex =
                /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            if (!emailRegex.test(email)) {
                return new Response(JSON.stringify({ error: 'Invalid email address' }), {
                    status: 400,
                    headers: {
                        ...CORS_HEADERS,
                        'Content-Type': 'application/json',
                    },
                });
            }

            const fromAddress = env.FROM_EMAIL || 'onboarding@resend.dev';
            const toAddress = env.TO_EMAIL || 'contact@robinpotze.com';

            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: `Contact Form <${fromAddress}>`,
                    to: [toAddress],
                    subject: `Portfolio contact from ${name}`,
                    reply_to: email,
                    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
                }),
            });

            if (!res.ok) {
                const error = await res.text();
                return new Error(
                    JSON.stringify({
                        error: 'Failed to send email',
                        details: error,
                    }),
                    {
                        status: 502,
                        headers: {
                            ...CORS_HEADERS,
                            'Content-Type': 'application/json',
                        },
                    }
                );
            }

            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: {
                    ...CORS_HEADERS,
                    'Content-Type': 'application/json',
                },
            });
        } catch (err) {
            return new Error(
                JSON.stringify({
                    error: 'Internal server error',
                    details: err,
                }),
                {
                    status: 500,
                    headers: {
                        ...CORS_HEADERS,
                        'Content-Type': 'application/json',
                    },
                }
            );
        }
    },
};

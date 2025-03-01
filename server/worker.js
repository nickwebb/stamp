export class ChatRoom {
    constructor(state, env) {
        this.state = state;
        this.env = env;
        this.sessions = new Map();
    }

    async fetch(request) {
        try {
            console.log('ChatRoom fetch called');
            
            if (request.headers.get('Upgrade') !== 'websocket') {
                return new Response('Expected websocket', { status: 400 });
            }

            const pair = new WebSocketPair();
            const [client, server] = Object.values(pair);

            // Accept the connection
            server.accept();
            
            const sessionId = crypto.randomUUID();
            console.log(`New connection accepted: ${sessionId}`);
            
            // Store the session
            this.sessions.set(sessionId, {
                socket: server,
                authenticated: false,
                user: null
            });

            server.addEventListener('message', async (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log(`Received message from ${sessionId}:`, data);

                    if (data.type === 'auth') {
                        // Store user info with the session
                        const session = this.sessions.get(sessionId);
                        session.authenticated = true;
                        session.user = data.user;
                        
                        // Send confirmation
                        server.send(JSON.stringify({
                            type: 'system',
                            text: `Connected (${this.sessions.size} active users)`
                        }));

                        // Broadcast user joined
                        this.broadcast({
                            type: 'system',
                            text: `${data.user.name} joined the chat`
                        }, sessionId);

                    } else if (data.type === 'message') {
                        // Only allow messages from authenticated sessions
                        const session = this.sessions.get(sessionId);
                        if (!session?.authenticated) {
                            console.log('Unauthenticated message attempt');
                            return;
                        }

                        console.log(`Broadcasting message from ${sessionId} to ${this.sessions.size} users`);
                        this.broadcast(data, sessionId);
                    }
                } catch (err) {
                    console.error(`Error handling message from ${sessionId}:`, err);
                }
            });

            server.addEventListener('close', () => {
                const session = this.sessions.get(sessionId);
                if (session?.user) {
                    this.broadcast({
                        type: 'system',
                        text: `${session.user.name} left the chat`
                    }, sessionId);
                }
                console.log(`Connection closed: ${sessionId}`);
                this.sessions.delete(sessionId);
            });

            server.addEventListener('error', (err) => {
                console.error(`WebSocket error for ${sessionId}:`, err);
                this.sessions.delete(sessionId);
            });

            return new Response(null, {
                status: 101,
                webSocket: client,
                headers: {
                    'Upgrade': 'websocket',
                    'Connection': 'Upgrade'
                }
            });

        } catch (err) {
            console.error('Error in ChatRoom:', err);
            return new Response('Internal Server Error', { status: 500 });
        }
    }

    broadcast(message, excludeId = null) {
        console.log(`Broadcasting to ${this.sessions.size} sessions, excluding ${excludeId}`);
        let delivered = 0;

        for (const [id, session] of this.sessions.entries()) {
            if (id !== excludeId && session.socket.readyState === 1) {
                try {
                    session.socket.send(JSON.stringify(message));
                    delivered++;
                } catch (err) {
                    console.error(`Failed to send to ${id}:`, err);
                    this.sessions.delete(id);
                }
            }
        }
        console.log(`Broadcast complete. Delivered to ${delivered} sessions`);
    }
}

const email = async function(formData, type, env) {
    const emailContent = formatEmailContent(formData, type);
    
    return await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            personalizations: [{
                to: [{ email: env.ADMIN_EMAIL }]
            }],
            from: { email: 'noreply@stamp.fm' },
            subject: `New ${type} Submission from Stamp`,
            content: [{
                type: 'text/plain',
                value: emailContent
            }]
        })
    });
};

const formatEmailContent = function(formData, type) {
    const timestamp = new Date().toISOString();
    let content = `New ${type} submission received at ${timestamp}\n\n`;

    for (const [key, value] of Object.entries(formData)) {
        if (key !== 'honeypot') {
            content += `${key}: ${value}\n`;
        }
    }

    return content;
};

import { handleArtistRoute } from './routes/artist.js';
import { artists } from './data/artists.js';

// Add this function to handle static file serving
async function serveStaticFile(url, env) {
    console.log('[Worker] Attempting to serve static file:', url.pathname);
    try {
        // Remove leading slash
        const key = url.pathname.substring(1);
        console.log('[Worker] Looking for file in R2:', key);

        // Try R2 first
        if (env.ASSETS) {
            const r2Object = await env.ASSETS.get(key);
            if (r2Object) {
                const headers = new Headers();
                headers.set('Content-Type', r2Object.httpMetadata.contentType || getContentType(key));
                headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
                headers.set('ETag', r2Object.httpEtag);
                
                return new Response(r2Object.body, {
                    headers
                });
            }
        }

        // Fallback to GitHub if not in R2
        console.log('[Worker] File not found in R2, trying GitHub fallback');
        const githubResponse = await fetch(`https://raw.githubusercontent.com/yourusername/stamp/main/web${url.pathname}`);
        if (!githubResponse.ok) {
            console.log('[Worker] File not found in GitHub either');
            return new Response('Not Found', { status: 404 });
        }

        return new Response(githubResponse.body, {
            headers: {
                'Content-Type': getContentType(url.pathname),
                'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
            }
        });
    } catch (error) {
        console.error('[Worker] Error serving static file:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

function getContentType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const contentTypes = {
        'html': 'text/html',
        'css': 'text/css',
        'js': 'application/javascript',
        'json': 'application/json',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'ico': 'image/x-icon',
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'pdf': 'application/pdf',
        'woff': 'font/woff',
        'woff2': 'font/woff2',
        'ttf': 'font/ttf',
        'eot': 'application/vnd.ms-fontobject'
    };
    return contentTypes[ext] || 'application/octet-stream';
}

// Artist data
const artists = [
    {
        id: "luna-echo",
        name: "Luna Echo",
        genres: ["Electronic", "Ambient"],
        image: "/images/artists/luna-echo-profile.jpg",
        headerImage: "/images/artists/luna-echo-header.jpg",
        profilePic: "/images/artists/luna-echo-avatar.jpg",
        followers: 15243,
        tracks: 42,
        bio: "Luna Echo creates ethereal soundscapes that transport listeners to otherworldly realms. Based in Los Angeles, she blends ambient textures with electronic beats to create an immersive sonic experience.",
        featuredTracks: [
            {
                title: "Midnight Dreams",
                duration: "4:32",
                plays: 52340,
                artwork: "/images/tracks/midnight-dreams.jpg"
            },
            {
                title: "Stellar Journey",
                duration: "5:15",
                plays: 48721,
                artwork: "/images/tracks/stellar-journey.jpg"
            },
            {
                title: "Ocean Waves",
                duration: "6:03",
                plays: 45123,
                artwork: "/images/tracks/ocean-waves.jpg"
            }
        ]
    },
    {
        id: "midnight-pulse",
        name: "Midnight Pulse",
        genres: ["House", "Techno"],
        image: "/images/artists/midnight-pulse-profile.jpg",
        headerImage: "/images/artists/midnight-pulse-header.jpg",
        profilePic: "/images/artists/midnight-pulse-avatar.jpg",
        followers: 28756,
        tracks: 67,
        bio: "Midnight Pulse drives the dance floor with hypnotic beats and pulsing rhythms. Their signature sound combines deep house grooves with techno elements.",
        featuredTracks: [
            {
                title: "Dance All Night",
                duration: "6:45",
                plays: 67890,
                artwork: "/images/tracks/dance-all-night.jpg"
            },
            {
                title: "Neon Lights",
                duration: "5:58",
                plays: 58432,
                artwork: "/images/tracks/neon-lights.jpg"
            },
            {
                title: "Urban Groove",
                duration: "7:12",
                plays: 51234,
                artwork: "/images/tracks/urban-groove.jpg"
            }
        ]
    }
];

async function handleArtistRoute(request) {
    const url = new URL(request.url);
    const artistId = url.pathname.split('/')[2];
    const artist = artists.find(a => a.id === artistId);

    if (!artist) {
        return new Response('Artist not found', { status: 404 });
    }

    try {
        // Fetch the artist profile template from static assets
        const response = await fetch('https://raw.githubusercontent.com/yourusername/stamp/main/web/artist-profile.html');
        if (!response.ok) throw new Error('Failed to fetch template');
        
        let html = await response.text();

        // Inject the artist data
        const scriptTag = `<script>
            console.log('[Artist Debug] Injected data available');
            window.artistData = ${JSON.stringify(artist)};
            console.log('[Artist Debug] Artist data:', window.artistData);
        </script>`;
        
        html = html.replace('</head>', `${scriptTag}</head>`);

        return new Response(html, {
            headers: {
                'Content-Type': 'text/html;charset=UTF-8'
            }
        });
    } catch (error) {
        console.error('Error handling artist route:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

export default {
    email,
    async fetch(request, env, ctx) {
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': '*'
        };

        // Handle OPTIONS
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            const url = new URL(request.url);
            console.log('[Worker] Handling request:', url.pathname);
            
            // Handle artist routes
            if (url.pathname.startsWith('/artist/')) {
                const response = await handleArtistRoute(request);
                // Add CORS headers
                const newHeaders = new Headers(response.headers);
                Object.entries(corsHeaders).forEach(([key, value]) => {
                    newHeaders.set(key, value);
                });
                return new Response(response.body, {
                    status: response.status,
                    headers: newHeaders
                });
            }

            // Handle existing API routes
            if (url.pathname.startsWith('/api/')) {
                // Handle artist routes first
                if (url.pathname.startsWith('/artist/')) {
                    console.log('[Worker] Delegating to artist route handler');
                    const response = await handleArtistRoute(request);
                    // Add CORS headers to the response
                    const newHeaders = new Headers(response.headers);
                    Object.entries(corsHeaders).forEach(([key, value]) => {
                        newHeaders.set(key, value);
                    });
                    return new Response(response.body, {
                        status: response.status,
                        headers: newHeaders
                    });
                }

                // Handle root path
                if (url.pathname === '/') {
                    return new Response('Stamp API is running', {
                        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
                    });
                }

                // Handle health check
                if (url.pathname === '/api/health') {
                    return new Response('OK', {
                        headers: corsHeaders
                    });
                }

                // Handle waitlist submissions
                if (url.pathname === '/api/waitlist' && request.method === 'POST') {
                    const formData = await request.json();
                    if (!formData.email) {
                        return new Response(
                            JSON.stringify({ message: 'Email is required' }),
                            { 
                                status: 400,
                                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                            }
                        );
                    }

                    const emailResponse = await email(formData, 'waitlist', env);
                    if (!emailResponse.ok) {
                        throw new Error('Failed to send email');
                    }

                    return new Response(
                        JSON.stringify({ success: true }),
                        { 
                            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                        }
                    );
                }

                // Handle authentication endpoints
                if (url.pathname === '/api/auth/login' && request.method === 'POST') {
                    const { email, password } = await request.json();
                    console.log('Processing login for:', email);

                    // Find user
                    const user = await env.DB.prepare(
                        'SELECT * FROM users WHERE email = ?'
                    ).bind(email).first();

                    if (!user || !(await comparePassword(password, user.password))) {
                        return new Response(
                            JSON.stringify({ message: 'Invalid credentials' }),
                            { 
                                status: 401,
                                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                            }
                        );
                    }

                    const token = await createJWT({ 
                        userId: user.id,
                        email: user.email,
                        artistName: user.artist_name // Make sure this column exists in your DB
                    }, env.JWT_SECRET);

                    return new Response(
                        JSON.stringify({
                            token,
                            user: {
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                artistName: user.artist_name
                            }
                        }),
                        { 
                            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                        }
                    );
                }

                if (url.pathname === '/api/auth/verify' && request.method === 'POST') {
                    try {
                        const { token } = await request.json();
                        if (!token) {
                            return new Response(
                                JSON.stringify({ 
                                    success: false, 
                                    message: 'Token is required' 
                                }),
                                { 
                                    status: 400,
                                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                                }
                            );
                        }

                        const payload = await verifyJWT(token, env.JWT_SECRET);
                        return new Response(
                            JSON.stringify({ 
                                success: true,
                                user: payload
                            }),
                            { 
                                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                            }
                        );

                    } catch (error) {
                        console.error('Token verification error:', error);
                        return new Response(
                            JSON.stringify({ 
                                success: false, 
                                message: 'Invalid token',
                                error: error.message 
                            }),
                            { 
                                status: 401,
                                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                            }
                        );
                    }
                }

                // Handle WebSocket upgrade for chat
                if (url.pathname === '/api/chat' && request.headers.get('Upgrade') === 'websocket') {
                    const id = env.CHAT_ROOM.idFromName('default');
                    const room = env.CHAT_ROOM.get(id);
                    return room.fetch(request);
                }

                // Add this inside the fetch function, before the 404 handler
                if (url.pathname === '/api/auth/register' && request.method === 'POST') {
                    try {
                        if (!env.JWT_SECRET) {
                            console.error('JWT_SECRET environment variable is not set');
                            throw new Error('Server configuration error');
                        }

                        const { name, email, password } = await request.json();
                        console.log('Processing registration for:', email);

                        // Check if user exists
                        const existing = await env.DB.prepare(
                            'SELECT * FROM users WHERE email = ?'
                        ).bind(email).first();

                        if (existing) {
                            return new Response(
                                JSON.stringify({ message: 'User already exists' }),
                                { 
                                    status: 400,
                                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                                }
                            );
                        }

                        // Hash password
                        const hashedPassword = await hashPassword(password);

                        // Create user
                        const result = await env.DB.prepare(
                            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'
                        ).bind(name, email, hashedPassword).run();

                        // Generate token
                        const token = await createJWT(
                            { userId: result.lastRowId },
                            env.JWT_SECRET
                        );

                        return new Response(
                            JSON.stringify({
                                token,
                                user: { 
                                    id: result.lastRowId,
                                    name,
                                    email
                                }
                            }),
                            { 
                                status: 201,
                                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                            }
                        );
                    } catch (error) {
                        console.error('Registration error:', error);
                        return new Response(
                            JSON.stringify({ 
                                message: 'Server error', 
                                error: error.message,
                                stack: error.stack
                            }),
                            { 
                                status: 500,
                                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                            }
                        );
                    }
                }
            }
            
            // Serve static files from R2 or GitHub
            const staticResponse = await serveStaticFile(url, env);
            if (staticResponse.ok) {
                const headers = new Headers(staticResponse.headers);
                Object.entries(corsHeaders).forEach(([key, value]) => {
                    headers.set(key, value);
                });
                return new Response(staticResponse.body, { headers });
            }

            // If no route matches, return 404
            return new Response('Not Found', { 
                status: 404,
                headers: corsHeaders
            });
        } catch (err) {
            console.error('[Worker] Error:', err);
            return new Response('Internal Server Error', { 
                status: 500,
                headers: corsHeaders
            });
        }
    }
};

// Helper functions for password hashing and JWT
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const passwordData = encoder.encode(password);
    
    const combinedData = new Uint8Array(salt.length + passwordData.length);
    combinedData.set(salt);
    combinedData.set(passwordData, salt.length);
    
    const hash = await crypto.subtle.digest('SHA-256', combinedData);
    const hashArray = new Uint8Array(hash);
    
    const combined = new Uint8Array(salt.length + hashArray.length);
    combined.set(salt);
    combined.set(hashArray, salt.length);
    
    return btoa(String.fromCharCode(...combined));
}

async function comparePassword(password, storedHash) {
    try {
        const encoder = new TextEncoder();
        const hashData = Uint8Array.from(atob(storedHash), c => c.charCodeAt(0));
        
        const salt = hashData.slice(0, 16);
        const storedHashPart = hashData.slice(16);
        
        const passwordData = encoder.encode(password);
        const combinedData = new Uint8Array(salt.length + passwordData.length);
        combinedData.set(salt);
        combinedData.set(passwordData, salt.length);
        
        const newHash = await crypto.subtle.digest('SHA-256', combinedData);
        const newHashArray = new Uint8Array(newHash);
        
        if (storedHashPart.length !== newHashArray.length) return false;
        
        for (let i = 0; i < storedHashPart.length; i++) {
            if (storedHashPart[i] !== newHashArray[i]) return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        return false;
    }
}

async function createJWT(payload, secret) {
    if (!secret) throw new Error('JWT configuration error');
    
    try {
        const encoder = new TextEncoder();
        const header = { alg: 'HS256', typ: 'JWT' };
        
        const encodedHeader = btoa(JSON.stringify(header));
        const encodedPayload = btoa(JSON.stringify(payload));
        
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );
        
        const signature = await crypto.subtle.sign(
            'HMAC',
            key,
            encoder.encode(`${encodedHeader}.${encodedPayload}`)
        );
        
        const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));
        
        return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
    } catch (error) {
        console.error('JWT creation error:', error);
        throw new Error('Failed to create authentication token');
    }
}

// Update the verifyJWT function to match your createJWT implementation
async function verifyJWT(token, secret) {
    try {
        const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
        
        // Decode payload first to check if token is well-formed
        const payload = JSON.parse(atob(encodedPayload));
        
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        // Verify signature using the same method as creation
        const signatureValid = await crypto.subtle.verify(
            'HMAC',
            key,
            Uint8Array.from(atob(encodedSignature), c => c.charCodeAt(0)),
            encoder.encode(`${encodedHeader}.${encodedPayload}`)
        );

        if (!signatureValid) {
            console.error('JWT signature verification failed');
            throw new Error('Invalid signature');
        }

        return payload;
    } catch (error) {
        console.error('JWT verification error:', error);
        throw new Error('Invalid token');
    }
}

addEventListener('fetch', event => {
  if (event.request.headers.get('Upgrade') === 'websocket') {
    // Handle WebSocket upgrade
    return handleWebSocket(event);
  } else {
    // Handle regular HTTP requests
    return handleRequest(event);
  }
});

async function handleWebSocket(event) {
  const pair = new WebSocketPair();
  const [client, server] = Object.values(pair);

  // Accept the WebSocket connection
  server.accept();

  // Handle the connection in your ChatRoom Durable Object
  const chatRoom = await getChatRoom();
  await chatRoom.handleConnection(server);

  return new Response(null, {
    status: 101,
    webSocket: client,
    headers: {
      'Upgrade': 'websocket',
      'Connection': 'Upgrade',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    }
  });
} 

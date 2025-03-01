import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Using ES module syntax for artists data
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

const app = express();
const port = process.env.PORT || 3002; // Using port 3002

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log('[Express Debug] Request:', {
        path: req.path,
        method: req.method,
        headers: req.headers,
        timestamp: new Date().toISOString()
    });
    next();
});

// Enable CORS with specific origin
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from the static file server
    credentials: true
}));

// Disable static file serving for artist-profile.html
app.use((req, res, next) => {
    if (req.path.endsWith('artist-profile.html')) {
        console.log('[Express Debug] Blocking static serve of artist-profile.html');
        return next('route');
    }
    next();
});

// Serve static files from the web directory
app.use(express.static(path.join(__dirname, '../web')));

// Artist route handler
app.get('/artist/:id', async (req, res) => {
    console.log('[Express Debug] Artist route handler triggered for:', req.params.id);
    try {
        const artistId = req.params.id;
        const artist = artists.find(a => a.id === artistId);

        if (!artist) {
            console.log('[Express Debug] Artist not found:', artistId);
            return res.status(404).send('Artist not found');
        }

        console.log('[Express Debug] Found artist:', artist);

        // Read the artist profile template
        const templatePath = path.join(__dirname, '../web/artist-profile.html');
        console.log('[Express Debug] Reading template from:', templatePath);
        
        let html = await fs.readFile(templatePath, 'utf-8');
        console.log('[Express Debug] Template loaded, length:', html.length);
        console.log('[Express Debug] Template head section:', html.substring(0, html.indexOf('</head>')));

        // Inject the artist data into the HTML
        const scriptTag = `<script>
            console.log('[Artist Debug] Injected data available');
            window.artistData = ${JSON.stringify(artist)};
            console.log('[Artist Debug] Artist data:', window.artistData);
        </script>`;
        
        html = html.replace('</head>', `${scriptTag}</head>`);
        console.log('[Express Debug] Data injection completed');

        // Send the modified HTML
        res.set('Content-Type', 'text/html');
        res.send(html);
        console.log('[Express Debug] Response sent');

    } catch (error) {
        console.error('[Express Debug] Error in artist route:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
    console.log('[Express Debug] Catch-all route hit:', req.path);
    res.sendFile(path.join(__dirname, '../web/index.html'));
});

app.listen(port, () => {
    console.log(`[Express] Server running at http://localhost:${port}`);
}); 
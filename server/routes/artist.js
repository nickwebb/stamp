import { artists } from '../data/artists.js';

export async function handleArtistRoute(request, env) {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    
    console.log('[Artist Route] Handling request:', {
        url: url.toString(),
        pathname: url.pathname,
        segments: pathSegments
    });
    
    // Handle /artist/:id route
    if (pathSegments[1] === 'artist' && pathSegments[2]) {
        const artistId = pathSegments[2];
        console.log('[Artist Route] Processing artist ID:', artistId);
        
        try {
            // Find the artist in our data
            console.log(`[Artist Route] Looking for artist with ID: ${artistId}`);
            const artist = artists.find(a => a.id === artistId);
            
            if (!artist) {
                console.log(`[Artist Route] Artist not found with ID: ${artistId}`);
                return new Response('Artist not found', { 
                    status: 404,
                    headers: {
                        'Content-Type': 'text/plain'
                    }
                });
            }
            
            console.log('[Artist Route] Found artist:', artist.name);
            
            // Fetch the HTML template
            console.log('[Artist Route] Fetching artist-profile.html template...');
            const response = await fetch(new URL('/artist-profile.html', url.origin));
            if (!response.ok) {
                throw new Error(`Failed to fetch template: ${response.status} ${response.statusText}`);
            }
            let html = await response.text();
            console.log('[Artist Route] Successfully loaded template');
            
            // Inject the artist data into the HTML
            console.log('[Artist Route] Injecting artist data into template...');
            const artistDataScript = `
                <script>
                    console.log('[Artist Profile] Initializing with artist data:', ${JSON.stringify(artist)});
                    window.artistData = ${JSON.stringify(artist)};
                </script>
            `;
            
            // Insert the script right after the opening <head> tag
            html = html.replace('<head>', '<head>' + artistDataScript);
            
            console.log('[Artist Route] Sending response...');
            return new Response(html, {
                headers: {
                    'Content-Type': 'text/html;charset=UTF-8'
                }
            });
        } catch (error) {
            console.error('[Artist Route] Error:', error);
            return new Response(`Error: ${error.message}`, { 
                status: 500,
                headers: {
                    'Content-Type': 'text/plain'
                }
            });
        }
    }

    console.log('[Artist Route] No matching route found');
    return new Response('Not Found', { 
        status: 404,
        headers: {
            'Content-Type': 'text/plain'
        }
    });
} 
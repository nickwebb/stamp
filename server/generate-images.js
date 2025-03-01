import { createCanvas } from 'canvas';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function generateImage(width, height, text, bgColor, textColor, filename) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Add some visual interest
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 100 + 50;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // Text
    ctx.fillStyle = textColor;
    ctx.font = `${Math.min(width, height) / 10}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);

    // Save the image
    const buffer = canvas.toBuffer('image/jpeg');
    await fs.writeFile(path.join(__dirname, '..', 'web', filename), buffer);
    console.log(`Generated ${filename}`);
}

async function generateAllImages() {
    const images = [
        // Luna Echo images
        {
            width: 1200,
            height: 400,
            text: 'Luna Echo Header',
            bgColor: '#1a1a2e',
            textColor: '#fff',
            filename: 'images/artists/luna-echo-header.jpg'
        },
        {
            width: 300,
            height: 300,
            text: 'Luna Echo',
            bgColor: '#2d3436',
            textColor: '#fff',
            filename: 'images/artists/luna-echo-avatar.jpg'
        },
        {
            width: 600,
            height: 600,
            text: 'Luna Echo Profile',
            bgColor: '#2d3436',
            textColor: '#fff',
            filename: 'images/artists/luna-echo-profile.jpg'
        },
        // Track artworks for Luna Echo
        {
            width: 200,
            height: 200,
            text: 'Midnight Dreams',
            bgColor: '#6c5ce7',
            textColor: '#fff',
            filename: 'images/tracks/midnight-dreams.jpg'
        },
        {
            width: 200,
            height: 200,
            text: 'Stellar Journey',
            bgColor: '#00b894',
            textColor: '#fff',
            filename: 'images/tracks/stellar-journey.jpg'
        },
        {
            width: 200,
            height: 200,
            text: 'Ocean Waves',
            bgColor: '#0984e3',
            textColor: '#fff',
            filename: 'images/tracks/ocean-waves.jpg'
        }
    ];

    for (const image of images) {
        await generateImage(
            image.width,
            image.height,
            image.text,
            image.bgColor,
            image.textColor,
            image.filename
        );
    }
}

generateAllImages().catch(console.error); 
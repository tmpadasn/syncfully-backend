/**
 * @fileoverview Profile Picture Generator Script
 * @description Utility script to generate unique avatar images for mock users.
 *
 * This script downloads abstract geometric avatars from DiceBear API
 * (https://dicebear.com) and saves them to the public uploads folder.
 * Each avatar is deterministically generated based on the username as a seed,
 * ensuring consistent avatars for the same user across regenerations.
 *
 * Usage:
 *   node scripts/generateProfilePictures.js
 *
 * Output:
 *   Creates PNG files in /public/uploads/profiles/
 *   Format: avatar_{userId}_{username}.jpg
 *
 * Dependencies:
 *   - Node.js built-in: fs, path, https, url
 *   - External API: DiceBear (no installation required)
 *
 * @module scripts/generateProfilePictures
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

// =============================================================================
// ES MODULE PATH RESOLUTION
// =============================================================================
// Convert import.meta.url to __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// User data - each username creates a unique avatar
const users = [
    { id: 1, username: 'alice' },
    { id: 2, username: 'bob' },
    { id: 3, username: 'carol' },
    { id: 4, username: 'david' },
    { id: 5, username: 'emma' },
    { id: 6, username: 'frank' },
    { id: 7, username: 'grace' },
    { id: 8, username: 'henry' },
    { id: 9, username: 'iris' },
    { id: 10, username: 'jack' }
];

// DiceBear styles similar to Boring Avatars (abstract/geometric)
// shapes, rings, thumbs, initials, bottts, identicon
const styles = ['shapes', 'rings', 'thumbs', 'bottts', 'identicon'];

// =============================================================================
// IMAGE DOWNLOAD UTILITY
// =============================================================================

/**
 * Downloads an image from a URL and saves it to the local filesystem.
 * Handles HTTP 301/302 redirects automatically.
 *
 * @param {string} url - Source URL to download from
 * @param {string} filepath - Local path to save the downloaded file
 * @returns {Promise<void>} Resolves when download completes
 * @throws {Error} If download fails (network error, invalid URL, etc.)
 *
 * @example
 * await downloadImage('https://example.com/image.png', '/path/to/save.png');
 */
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        // Inner function to handle redirects recursively
        const request = (urlToFetch) => {
            https.get(urlToFetch, (response) => {
                // Handle HTTP redirects (301 Moved Permanently, 302 Found)
                if (response.statusCode === 301 || response.statusCode === 302) {
                    // Follow redirect to new location
                    request(response.headers.location);
                    return;
                }

                // Create write stream and pipe response data to file
                const file = fs.createWriteStream(filepath);
                response.pipe(file);

                // Resolve promise when file write completes
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            }).on('error', (err) => {
                // Clean up partial file on error and reject promise
                fs.unlink(filepath, () => { });
                reject(err);
            });
        };

        // Initiate the request
        request(url);
    });
}

async function generateProfilePictures() {
    const outputDir = path.join(__dirname, '../public/uploads/profiles');

    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('Fetching abstract avatars from DiceBear...\n');

    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const style = styles[i % styles.length];

        // DiceBear API with abstract/geometric styles
        const url = `https://api.dicebear.com/7.x/${style}/png?seed=${user.username}&size=80`;

        const filename = `avatar_${user.id}_${user.username}.jpg`;
        const filepath = path.join(outputDir, filename);

        try {
            await downloadImage(url, filepath);
            const stats = fs.statSync(filepath);
            console.log(`Downloaded: ${filename} (${stats.size} bytes) - style: ${style}`);
        } catch (error) {
            console.error(`Failed to download ${filename}:`, error.message);
        }

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log('\nAll profile pictures generated successfully!');
}

generateProfilePictures();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

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

// Download image from URL (follows redirects)
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const request = (urlToFetch) => {
            https.get(urlToFetch, (response) => {
                if (response.statusCode === 301 || response.statusCode === 302) {
                    request(response.headers.location);
                    return;
                }
                const file = fs.createWriteStream(filepath);
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            }).on('error', (err) => {
                fs.unlink(filepath, () => {});
                reject(err);
            });
        };
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

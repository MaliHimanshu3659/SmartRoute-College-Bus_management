const https = require('https');
const fs = require('fs');
const path = require('path');

const TILE_CACHE_DIR = path.join(__dirname, '../../data/tile_cache');
try {
    if (!fs.existsSync(TILE_CACHE_DIR)) {
        fs.mkdirSync(TILE_CACHE_DIR, { recursive: true });
    }
} catch (e) {
    console.error('Failed to create tile cache dir:', e.message);
}

function getTile(req, res) {
    const { z, x, y } = req.params;
    const cleanY = (y || '').replace('.png', '');

    const zNum = parseInt(z, 10);
    const xNum = parseInt(x, 10);
    const yNum = parseInt(cleanY, 10);

    if (isNaN(zNum) || isNaN(xNum) || isNaN(yNum)) {
        return res.status(400).send('Invalid tile coordinates');
    }

    const cacheFilePath = path.join(TILE_CACHE_DIR, `${zNum}_${xNum}_${yNum}.png`);

    // Return from disk cache if already cached
    if (fs.existsSync(cacheFilePath)) {
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
        return fs.createReadStream(cacheFilePath).pipe(res);
    }

    // Fetch from OpenStreetMap with sanctioned application User-Agent
    const url = `https://tile.openstreetmap.org/${zNum}/${xNum}/${yNum}.png`;
    const request = https.get(url, {
        headers: {
            'User-Agent': 'SmartRoute-CollegeBusManagement/2.0 (student-project; educational-use)'
        },
        timeout: 8000
    }, (osmRes) => {
        if (osmRes.statusCode === 200) {
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Cache-Control', 'public, max-age=604800, immutable');

            const writeStream = fs.createWriteStream(cacheFilePath);
            osmRes.pipe(writeStream);
            osmRes.pipe(res);
        } else {
            res.status(osmRes.statusCode).end();
        }
    });

    request.on('error', (err) => {
        console.error('[Tile Proxy] Error fetching tile:', err.message);
        res.status(502).end();
    });
}

module.exports = { getTile };

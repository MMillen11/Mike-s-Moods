const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PORT = 5000;
const BACKEND_PORT = 5001;
const BACKEND_HOST = 'localhost';

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`Request: ${req.method} ${req.url}`);
    
    // Handle API requests (proxy to backend)
    if (req.url.startsWith('/api/')) {
        // Proxy the request to the Python backend
        proxyRequest(req, res);
        return;
    }
    
    // Normalize URL path
    let filePath = req.url === '/' ? '/index.html' : req.url;
    
    // Check if the file is in the root directory first
    let rootFilePath = path.join(__dirname, '..', filePath);
    
    // If the file doesn't exist in the root, look in the frontend directory
    fs.access(rootFilePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File not in root, try frontend directory
            filePath = path.join(__dirname, filePath);
            serveFile(filePath, res);
        } else {
            // File exists in root
            serveFile(rootFilePath, res);
        }
    });
});

// Function to serve a file
function serveFile(filePath, res) {
    // Get file extension
    const extname = path.extname(filePath).toLowerCase();
    
    // Set content type based on file extension
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    // Read file
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                fs.readFile(path.join(__dirname, '..', 'index.html'), (err, content) => {
                    if (err) {
                        // Try the frontend directory
                        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
                            if (err) {
                                // Something went very wrong
                                res.writeHead(500);
                                res.end('Server Error');
                            } else {
                                // Return index.html for client-side routing
                                res.writeHead(200, { 'Content-Type': 'text/html' });
                                res.end(content, 'utf-8');
                            }
                        });
                    } else {
                        // Return index.html from root for client-side routing
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf-8');
                    }
                });
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // Success
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

// Function to proxy requests to the backend
function proxyRequest(req, res) {
    const options = {
        hostname: BACKEND_HOST,
        port: BACKEND_PORT,
        path: req.url,
        method: req.method,
        headers: {
            ...req.headers,
            host: `${BACKEND_HOST}:${BACKEND_PORT}`
        }
    };

    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
        console.error('Proxy request error:', err);
        res.writeHead(502);
        res.end('Bad Gateway - Backend server may be down');
    });

    // If the original request has a body, pipe it to the proxy request
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        req.pipe(proxyReq, { end: true });
    } else {
        proxyReq.end();
    }
}

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`API requests will be proxied to http://${BACKEND_HOST}:${BACKEND_PORT}/`);
    console.log(`Press Ctrl+C to stop the server`);
}); 
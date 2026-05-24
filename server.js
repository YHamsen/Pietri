// PIETRI — LWS cPanel Passenger entry point
// Delegates to Next.js standalone server (which loads .env.production automatically)
'use strict';

const path = require('path');

// Force low-RAM settings for CloudLinux LVE
process.env.UV_THREADPOOL_SIZE = process.env.UV_THREADPOOL_SIZE || '1';
process.env.NODE_ENV = 'production';

const standaloneDir = path.join(__dirname, 'standalone');
console.log('[pietri] Starting standalone from:', standaloneDir);

// Standalone server calls process.chdir(__dirname) internally
// and loads .env.production via @next/env automatically
require(path.join(standaloneDir, 'server.js'));

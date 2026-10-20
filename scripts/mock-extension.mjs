#!/usr/bin/env node
/**
 * scripts/mock-extension.mjs
 * Dev-only standalone mock extension server implementing Kamui Protocol Schema 1.
 * Returns freely licensed sample media (Big Buck Bunny).
 * Run: node scripts/mock-extension.mjs
 */

import http from 'http';
import url from 'url';

const PORT = 3456;

// Sample public domain / Creative Commons video URL (Blender Foundation)
const SAMPLE_MP4 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const SAMPLE_HLS = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

const MANIFEST = {
  schema: 1,
  id: "com.kamui.devmock",
  name: "Local Mock Extension",
  version: "1.0.0",
  description: "Dev-only reference provider serving Creative Commons sample streams (Big Buck Bunny) on localhost.",
  homepage: `http://localhost:${PORT}`,
  resources: ["stream"]
};

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // Set permissive CORS headers for local dev browser requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // GET /manifest.json
  if (pathname === '/manifest.json') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(MANIFEST, null, 2));
    return;
  }

  // GET /stream/anilist/<id>/<episode>.json
  const streamMatch = pathname.match(/^\/stream\/anilist\/([^\/]+)\/([^\/]+)\.json$/);
  if (streamMatch) {
    const anilistId = streamMatch[1];
    const episode = streamMatch[2];

    const response = {
      streams: [
        {
          title: `1080p MP4 (Episode ${episode})`,
          type: "http",
          url: SAMPLE_MP4,
          quality: "1080p",
          language: "ja",
          subtitles: [
            {
              lang: "en",
              label: "English",
              url: "https://raw.githubusercontent.com/brenopolanski/html5-video-webvtt-example/master/subtitles-en.vtt"
            }
          ]
        },
        {
          title: `720p HLS Stream (Episode ${episode})`,
          type: "hls",
          url: SAMPLE_HLS,
          quality: "720p",
          language: "ja"
        }
      ]
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response, null, 2));
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Route not found' }));
});

server.listen(PORT, () => {
  console.log(`[Kamui Mock Extension] Running at http://localhost:${PORT}`);
  console.log(`[Kamui Mock Extension] Manifest: http://localhost:${PORT}/manifest.json`);
});

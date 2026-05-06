# TorqueLoop FFmpeg Worker

Sidecar service that provides frame extraction and audio analysis capabilities for the Creative QA engine.

## Why a Sidecar?

Vercel serverless functions do **not** include `ffmpeg` or `ffprobe` binaries. Checks 3 (Brand Presence) and 4 (Audio Levels) require these tools. This worker runs on a VPS with ffmpeg installed.

## Endpoints

| Method | Path             | Body                                        | Returns                      |
|--------|------------------|---------------------------------------------|------------------------------|
| POST   | /extract-frame   | `{ videoUrl, timestamp? }`                  | `{ frameBase64 }`            |
| POST   | /extract-frames  | `{ videoUrl, timestamps: number[] }`        | `{ frames: string[] }`       |
| POST   | /audio-levels    | `{ videoUrl }`                              | `{ voLufs, musicLufs, deltaDb }` |
| GET    | /health          | —                                           | `{ status: "ok" }`           |

## Deployment (Ubuntu/Debian)

```bash
# Install ffmpeg
sudo apt update && sudo apt install -y ffmpeg nodejs npm

# Install deps
cd services/ffmpeg-worker
npm install

# Run
PORT=3100 AUTH_TOKEN=your-secret npm start
```

### With systemd

```ini
# /etc/systemd/system/tl-ffmpeg-worker.service
[Unit]
Description=TorqueLoop FFmpeg Worker
After=network.target

[Service]
Type=simple
User=worker
WorkingDirectory=/opt/tl-ffmpeg-worker
ExecStart=/usr/bin/node dist/server.js
Restart=always
Environment=PORT=3100
Environment=AUTH_TOKEN=your-secret

[Install]
WantedBy=multi-user.target
```

## Environment Variables

| Variable     | Default    | Description                          |
|-------------|------------|--------------------------------------|
| PORT        | 3100       | Listen port                          |
| AUTH_TOKEN  | (none)     | Bearer token for request auth        |
| FFMPEG_BIN  | ffmpeg     | Path to ffmpeg binary                |
| FFPROBE_BIN | ffprobe    | Path to ffprobe binary               |

## Connecting to TorqueLoop

Set `FFMPEG_SERVICE_URL` in your Vercel environment:

```
FFMPEG_SERVICE_URL=https://ffmpeg.torqueloop.com
```

The Creative QA route will automatically delegate frame extraction and audio analysis to this worker.

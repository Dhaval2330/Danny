#!/usr/bin/env bash
# Builds the two deliverables from out/raw.mp4.
set -euo pipefail
cd "$(dirname "$0")/../out"
# Master: conference-room playback. H.264 High@4.1, yuv420p, ~20 Mbps, AAC 48 kHz, faststart.
ffmpeg -v error -y -i raw.mp4 -c:v libx264 -profile:v high -level 4.1 -pix_fmt yuv420p \
  -preset slow -b:v 20M -maxrate 25M -bufsize 40M -r 30 \
  -c:a aac -b:a 320k -ar 48000 -movflags +faststart FlashMatch_Investor_Film_MASTER_1080p.mp4
# Online: compressed for secure sharing.
ffmpeg -v error -y -i raw.mp4 -c:v libx264 -profile:v high -level 4.0 -pix_fmt yuv420p \
  -preset slow -crf 23 -maxrate 6M -bufsize 12M -r 30 \
  -c:a aac -b:a 160k -ar 48000 -movflags +faststart FlashMatch_Investor_Film_WEB_1080p.mp4
ls -la *.mp4

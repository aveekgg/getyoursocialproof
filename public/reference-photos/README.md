# Reference Photos for AI Video Matching

This directory contains reference images used for similarity matching during video recording for the "My Room, My Vibe" challenge.

## Current Reference Images:

- `cozy-corner.jpg` - Reference for "favorite-corner" prompt
- `study-desk.jpg` - Reference for "study-setup" prompt  
- `kitchen.jpg` - Reference for "kitchen-tour" prompt
- `window-view.jpg` - Reference for "window-view" prompt
- `living-area.jpg` - Reference for "chill-zone" prompt

## Usage:

These images are used by the TensorFlow.js MobileNet model to calculate similarity scores between the live video feed and reference room layouts. When similarity exceeds 85%, users receive bonus points for "Perfect Match!"

## Image Requirements:

- Format: JPG/PNG
- Size: Optimized for web (< 500KB recommended)
- Content: Clear, well-lit room/furniture photos
- CORS: Must be accessible from the same domain

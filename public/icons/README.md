# PWA Icons

This directory contains all the PWA icons and splash screens for the Hong Kong Church PWA.

## Generated Files

### Main PWA Icons (SVG format)
- icon-16x16.svg - Favicon (16x16)
- icon-32x32.svg - Favicon (32x32)
- icon-72x72.svg - Android Chrome (72x72)
- icon-96x96.svg - Android Chrome (96x96)
- icon-128x128.svg - Android Chrome (128x128)
- icon-144x144.svg - Android Chrome (144x144)
- icon-152x152.svg - Apple Touch (152x152)
- icon-192x192.svg - Android Chrome (192x192)
- icon-384x384.svg - Android Chrome (384x384)
- icon-512x512.svg - Android Chrome (512x512)

### Shortcut Icons
- shortcut-devotion.svg - Daily devotion shortcut
- shortcut-prayer.svg - Prayer requests shortcut
- shortcut-events.svg - Events shortcut

### Apple Splash Screens
- apple-splash-640-1136.svg - iPhone 5/SE
- apple-splash-750-1334.svg - iPhone 6/7/8
- apple-splash-1125-2436.svg - iPhone X/XS
- apple-splash-1242-2208.svg - iPhone Plus
- apple-splash-1536-2048.svg - iPad
- apple-splash-1668-2224.svg - iPad Pro 10.5"
- apple-splash-2048-2732.svg - iPad Pro 12.9"

## Converting to PNG

For production use, convert these SVG files to PNG format using:

```bash
# Using ImageMagick (if installed)
convert icon-192x192.svg icon-192x192.png

# Using Sharp CLI (npm install -g sharp-cli)
sharp -i icon-192x192.svg -o icon-192x192.png

# Or use online tools like:
# - https://convertio.co/svg-png/
# - https://cloudconvert.com/svg-to-png
```

## Icon Design

The icons feature a minimalist church design with:
- Purple theme color (#7C3AED) matching the app theme
- Church building with cross on top
- White background with rounded corners
- Clean, recognizable design that works at all sizes

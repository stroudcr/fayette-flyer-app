#!/usr/bin/env python3
from PIL import Image

# Load the three PNG sizes
img_16 = Image.open('/tmp/icon-16.png')
img_32 = Image.open('/tmp/icon-32.png')
img_48 = Image.open('/tmp/icon-48.png')

# Save as multi-resolution ICO
img_48.save('src/app/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)],
            append_images=[img_16, img_32])

print('✓ Generated src/app/favicon.ico with 16x16, 32x32, and 48x48 sizes')

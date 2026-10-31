import os
from PIL import Image, ImageOps

TARGET_SIZE = (1800, 1200) # 3:2 ratio

inputs = [
  ('evidence/stage-2-build/frontend/desktop-1440px.png', 'submission/assets/gallery-01-workbench.png'),
  ('demo/assets/architecture.png', 'submission/assets/gallery-02-architecture.png'),
  ('evidence/stage-2-build/frontend/tab-waterfall.png', 'submission/assets/gallery-03-waterfall.png'),
  ('evidence/stage-2-build/frontend/tab-economics.png', 'submission/assets/gallery-04-economics.png'),
  ('evidence/stage-3-qa/screens/scenario-presets-preset-miso-coal-desktop.png', 'submission/assets/gallery-05-coal-grid.png'),
  ('evidence/stage-2-build/frontend/modal-audit.png', 'submission/assets/gallery-06-audit-spec.png'),
  ('evidence/stage-2-build/frontend/mobile-390px.png', 'submission/assets/gallery-07-mobile.png'),
]

for src, dst in inputs:
  if not os.path.exists(src):
    print(f"Skipping {src}, not found")
    continue
  im = Image.open(src)
  # Fit into 1800x1200 with background padding #0B0F17
  fitted = ImageOps.pad(im, TARGET_SIZE, color=(11, 15, 23))
  fitted.save(dst, format='PNG', optimize=True)
  size_mb = os.path.getsize(dst) / (1024 * 1024)
  print(f"Created {dst}: 1800x1200 (3:2), {size_mb:.2f} MB")

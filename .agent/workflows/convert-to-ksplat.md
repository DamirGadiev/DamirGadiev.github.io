---
description: How to convert .ply to .ksplat for performance
---

To optimize your Gaussian Splat performance, convert your `.ply` files to the `.ksplat` format. Here is a guide designed for a Python-based coding agent.

### 🐍 Python Conversion Guide

We recommend using the **`3dgsconverter`** utility.

#### 1. Install the Converter
Run this in your terminal:
```bash
pip install 3dgsconverter
```

#### 2. Python Conversion Script
You can use this script to automate the conversion of your models:

```python
import subprocess
import os

def convert_ply_to_ksplat(input_path, output_path=None):
    if not output_path:
        output_path = input_path.replace('.ply', '.ksplat')
    
    print(f"Converting {input_path} to {output_path}...")
    
    # Run the 3dgsconverter CLI
    try:
        subprocess.run([
            "3dgsconverter",
            "-i", input_path,
            "-o", output_path,
            "-f", "ksplat",
            # ADVANCED PERFORMANCE OPTIONS:
            "--compression", "2",      # Higher compression (0, 1, or 2)
            "--sh", "1",               # Lower SH degree (Default 3, try 1 or 0 for faster rendering)
            "--alpha-threshold", "10"  # Prune more transparent splats (Default is lower)
        ], check=True)
        print("Conversion successful!")
    except subprocess.CalledProcessError as e:
        print(f"Error during conversion: {e}")

# Usage for your project:
input_model = "public/models/splat.ply"
output_model = "public/models/splat.ksplat"
convert_ply_to_ksplat(input_model, output_model)
```

#### 3. Update the Website
Once converted, update your `src/main.js` to point to the new `.ksplat` file:

```javascript
// src/main.js
await this.splatViewer.addSplatScene('/models/splat.ksplat', {
    'progressiveLoad': true,
});
```

### 💡 Advanced Performance Tips
- **Pruning**: Increasing `--alpha-threshold` (e.g., to 10 or 15) will remove more "noise" and transparent splats, which is the best way to speed up rendering.
- **SH Degree**: Setting `--sh 1` or `--sh 0` significantly reduces the amount of work the GPU has to do per frame, though colors might look slightly flatter.
- **Point Spacing**: Some converters allow decimating the point cloud based on distance (voxels), which can drastically reduce the point count for complex scenes.

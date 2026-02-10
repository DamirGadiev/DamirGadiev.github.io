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
            "-f", "ksplat"
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

### 💡 Why use .ksplat?
- **Small size**: Much smaller than `.ply`.
- **Fast loading**: Optimized for the `GaussianSplats3D` library.
- **Lower memory**: Uses less VRAM on your visitors' devices.

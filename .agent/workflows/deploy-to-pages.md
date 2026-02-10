---
description: how to deploy the application to GitHub Pages
---

To deploy your application, follow these steps:

1. **Commit and Push**: Ensure all your changes are committed and pushed to the `main` branch.
   ```bash
   git add .
   git commit -m "Modernize website with Vite and Three.js"
   git push origin main
   ```

2. **GitHub Repository Settings**:
   - Go to your repository on GitHub.
   - Click on **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions** from the dropdown menu.

3. **Verify Deployment**:
   - Go to the **Actions** tab in your repository.
   - You should see a "Deploy static content to Pages" workflow running.
   - Once it completes, your site will be live at `https://DamirGadiev.github.io/`.

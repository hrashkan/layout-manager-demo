# Layout Manager React - Demo

A comprehensive demo showcasing the features of the `layout-manager-react` package.

## Features

- 🎛️ **Complex Nested Layouts** - Create sophisticated multi-panel layouts
- 🔄 **LTR/RTL Support** - Switch between left-to-right and right-to-left layouts
- 🧩 **Component Toggling** - Dynamically add/remove components from the layout
- 📜 **Scroll Buttons** - Automatic scroll buttons when tabs overflow
- 💾 **Layout Persistence** - Save and restore layouts using localStorage
- 🎨 **Beautiful UI** - Modern, gradient-based design with icons

## Live Demo

Visit the [live demo on GitHub Pages](https://hrashkan/layout-manager-demo/)

> **Note:** Replace `your-username` with your GitHub username and `layout-manager-demo` with your repository name if different.

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

This demo is automatically deployed to GitHub Pages on every push to the main branch.

### Manual Deployment

```bash
# Build for GitHub Pages
npm run build:gh-pages

# Deploy (requires gh-pages package)
npm run deploy
```

## Project Structure

```
├── src/
│   ├── App.tsx          # Main application component
│   ├── main.tsx          # Application entry point
│   └── assets/           # Static assets
├── public/               # Public assets
├── index.html            # HTML template
└── vite.config.ts        # Vite configuration
```

## Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **layout-manager-react** - Layout management library

## License

MIT

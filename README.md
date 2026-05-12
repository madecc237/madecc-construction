# MADECC Construction - CEO Command Center & Enterprise Site

[![Netlify Status](https://api.netlify.com/api/v1/badges/bc901e9d-3467-4632-9ecb-36398f623912/deploy-status)](https://app.netlify.com/sites/superlative-dodol-be109f/deploys)

A high-performance, secure construction management and public-facing website built with React, Vite, and Express.

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher
- **VS Code**: Recommended editor

### 1. Clone & Open
Download or clone the repository and open the folder in VS Code.

### 2. Install Dependencies
Open your terminal in VS Code (`Ctrl + ` `) and run:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and copy the contents from `.env.example`. Fill in the required keys:

```env
# Required for AI and Maps integrations
GEMINI_API_KEY=your_gemini_key
GOOGLE_MAPS_PLATFORM_KEY=your_maps_key

# SMTP Configuration for Alerts & Contact Forms
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
CONTACT_RECEIVER_EMAIL=ceo_madecc_rodrick@madecc-constructionltd.online
```

### 4. Running the Development Server
Start the full-stack environment (React + Express):
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

---

## 🛠 Tech Stack & Dependencies

### Core Frameworks
- **React 19**: UI modern view library.
- **Express 4**: Backend API and server-side logic.
- **Vite 6**: Lightning-fast build tool and dev server.

### Security & Logic
- **Firebase 12**: Database (Firestore) and Authentication.
- **motion (Framer Motion)**: Cinematic UI animations and micro-interactions.
- **lucide-react**: High-quality SVG icon set.
- **tsx**: Direct TypeScript execution for the server.

### Utilities
- **jsPDF & jsPDF-autotable**: Generates forensic evidence reports for security logs.
- **recharts**: Visual data analytics for the CEO dashboard.
- **date-fns**: Precise timestamp processing.
- **nodemailer**: Handles automated security alerts dispatched to the CEO.

---

## 📁 Project Structure

- `src/`: React frontend source code.
  - `components/`: Reusable UI elements (Galleries, Security Terminal, etc).
  - `context/`: Authentication and Security state management.
  - `pages/`: Route-level components (Admin Dashboard, Public Site).
- `server.ts`: Express backend entry point.
- `firebase-blueprint.json`: Data structure definition for Firestore.
- `public/`: Static assets (Logos, Icons).

---

## ⚡ Production Build
To prepare the application for deployment:
```bash
npm run build
```
Static files will be generated in the `dist/` directory, ready to be served by the Express server in production mode.

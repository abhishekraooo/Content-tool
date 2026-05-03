# College Content Tool

A powerful, AI-driven content generation tool tailored for college departments and student clubs. It transforms raw event details or attached files (PDFs/Images) into structured poster content and engaging social media captions in seconds.

## Features

- **AI Content Generation**: Generates contextual poster highlights, Instagram/Facebook captions, short tweets, and relevant hashtags.
- **Dual Providers**: Utilizes Google Gemini (`gemini-3-flash-preview`) as the primary AI engine with Groq (`llama-3.3-70b-versatile`) as a robust fallback.
- **Local File Parsing**: Privacy-first file extraction. Upload brochures or event PDFs, and the app uses `pdfjs-dist` and `tesseract.js` to extract text locally on the client without sending files directly to third-party vision APIs.
- **Dynamic Output Targeting**: Generate only Poster Context, only Media Context, or Both to save AI processing time and tokens.
- **Save & Share Community**: Save generations anonymously to Firebase Firestore. Share specific posts via direct links, or browse all previous generations on the `/explore` page.
- **Responsive & Minimal UI**: A clean, glassmorphism-inspired multi-column layout that gracefully collapses on mobile devices.

## Tech Stack

- **Frontend**: React (Vite)
- **Backend API**: Vercel Serverless Functions (Node.js)
- **AI Integration**: `@google/genai` (Gemini), `groq-sdk` (Llama 3.3)
- **Database**: Firebase (Firestore via `firebase-admin`)
- **File Parsing**: `tesseract.js` (Images), `pdfjs-dist` (PDFs)

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/college-content-tool.git
   cd college-content-tool
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env.local` file in the root directory and add the following keys:
   ```env
   # AI Providers
   GEMINI_API_KEY=your_gemini_key
   GROQ_API_KEY=your_groq_key

   # Firebase Admin SDK
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_client_email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

4. **Run the development server:**
   Because this project uses Vercel Serverless Functions (`/api/*`), you must use the Vercel CLI to run it locally:
   ```bash
   npx vercel dev
   ```

## Contributing

Contributions are always welcome! Please open an issue or submit a pull request if you have ideas for new features, bug fixes, or improvements.

## License

This project is open-source and available under the [MIT License](LICENSE).

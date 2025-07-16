# Ziply - Modern File Utilities

<div align="center">
  <img src="client/public/ziply-logo-docs.svg" alt="Ziply Logo" width="240" height="80" style="margin: 20px 0;" />
</div>

Ziply is a sleek, modern, and dynamic web application designed to provide a suite of powerful and easy-to-use file manipulation tools. Built with a responsive, theme-aware interface, it offers a seamless user experience for all your file processing needs.

**Try it here 👉🏻 [Ziply](https://ziply-frontend.onrender.com/)**


## ✨ Features

- **🔒 Privacy-First Processing:** 
  - No user login required - your files are processed in real-time
  - Zero data storage - all file processing happens instantly and locally
  - Your files never leave your browser - complete privacy guaranteed
- **🎨 Dual-Themed Interface:** Toggle between a beautiful, modern dark mode and a clean, professional light mode. Your preference is automatically saved for your next visit.
- **🖼️ Image Compression:** Upload any image and use the intuitive slider to select the perfect compression quality, giving you full control over the file size.
- **📄 PDF Merging:** Combine multiple PDF files into a single, unified document with just a few clicks.
- **🔄 Image Format Conversion:** Easily convert your images to a variety of popular formats, including PNG, JPEG, WebP, and GIF.
- **🚀 Dynamic UI:**
  - **Rotating Taglines:** The homepage features a dynamic, rotating tagline to keep the experience fresh and engaging.
  - **Image Previews:** See a preview of your selected image directly in the upload area before processing.
  - **Responsive Design:** A fully responsive layout that looks great on any device, from desktops to mobile phones.

## 🛠️ Tech Stack

- **Frontend:**
  - **Next.js:** A powerful React framework for building fast and modern web applications.
  - **React:** The core library for building the user interface.
  - **TypeScript:** For robust, type-safe code.
  - **CSS Modules:** For locally scoped, component-level styling.
- **Backend:**
  - **Express.js:** A fast and minimal web framework for Node.js, used to power our API.
  - **`sharp`:** A high-performance Node.js library for image processing.
  - **`pdf-lib`:** A library for creating and modifying PDF documents in JavaScript.
  - **`multer`:** A Node.js middleware for handling `multipart/form-data`, used for file uploads.

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18.x or later)
- npm

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/ziply.git
    cd ziply
    ```
2.  **Install all dependencies (recommended):**
    ```sh
    npm run install-all
    ```
    
    Or install manually:
    ```sh
    # Install root dependencies
    npm install
    
    # Install frontend dependencies
    cd client && npm install
    
    # Install backend dependencies
    cd ../server && npm install
    ```

### Running the Application

#### Option 1: Using Root Scripts (Recommended)
```sh
# Start both frontend and backend concurrently
npm run dev
```

#### Option 2: Separate Terminals
You will need two separate terminals to run both the frontend and backend servers concurrently.

1.  **Start the Backend Server:**
    *   Navigate to the `server` directory and run:
        ```sh
        npm start
        ```
    *   The backend will be running on `http://localhost:5001`.

2.  **Start the Frontend Server:**
    *   Navigate to the `client` directory and run:
        ```sh
        npm run dev
        ```
    *   The frontend development server will start. Open your browser and go to `http://localhost:3000` to see the application.

## 🚀 Deployment

### Render Deployment

This project is configured for easy deployment on Render. The root `package.json` includes the necessary build scripts.

1. **Connect your GitHub repository to Render**
2. **Create a new Web Service**
3. **Configure the following settings:**
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node.js

The build process will automatically:
- Install all dependencies
- Build the Next.js frontend
- Set up the Express.js backend

---

This project was built with the goal of creating a fast, reliable, and beautiful set of tools for everyday file tasks. Enjoy!

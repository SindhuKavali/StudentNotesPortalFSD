# Student Notes Exchange Portal

A comprehensive full-stack web application built with the MERN stack for college students to upload, browse, and share academic study materials.

## Features
- **User Authentication:** JWT-based auth with bcrypt password hashing.
- **Notes Upload:** Upload PDF, JPG, PNG documents locally (ready to switch to Cloudinary).
- **Advanced Search & Filter:** Find notes by subject code, branch, semester, and tags.
- **Voting System:** Upvote and downvote notes; popular notes rise to the top.
- **Analytics & Dashboard:** Track personal uploads, total downloads, and upvotes.
- **Discussion:** Built-in comments section on every note.
- **AI-like Recommendations:** Automatically suggests similar notes based on subject and tags.
- **Responsive UI:** Modern, dynamic design built with React and Tailwind CSS v4.

## Tech Stack
- **Frontend:** React, React Router, Vite, Tailwind CSS, Axios, Lucide React
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, Multer, JSONWebToken

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB running locally or a MongoDB Atlas URI

### 1. Clone & Setup Backend
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student_notes
JWT_SECRET=super_secret_jwt_key_123!
```

Start the backend server:
```bash
npm run start # or node server.js
```

### 2. Setup Frontend
```bash
cd client
npm install
```

Start the frontend development server:
```bash
npm run dev
```

### 3. Usage
Navigate to `http://localhost:5173` in your browser.
You can create a new student account, login, and start uploading or browsing notes.

## Future Enhancements
- Integrate Cloudinary for scalable file storage.
- Admin Panel for user and content moderation.
- Push notifications for comments and downloads.
- PDF Previewer integration (react-pdf).

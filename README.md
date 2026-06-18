chatapp
Ask DeepWiki

This is a full-stack, real-time chat application built with Node.js, Express, React, and MongoDB. It features both global and private (one-on-one) messaging capabilities powered by Socket.IO.

Features
Real-time Messaging: Instant message delivery using WebSockets (Socket.IO).
Global Chat: A public chat room where all connected users can communicate.
Private Chat: Secure one-on-one messaging between users.
User Authentication: Secure user registration and login system using JWT (Access and Refresh Tokens).
Image Uploads: Users can upload profile avatars and cover images, which are handled by Multer and stored on Cloudinary.
Infinite Scrolling: Efficiently load older messages on demand as the user scrolls up.
User Discovery: View and search for other registered users to initiate private conversations.
State Management: Centralized frontend state management using Redux Toolkit.
Responsive UI: A clean and functional user interface built with React and Tailwind CSS.
Tech Stack
Backend

Framework: Node.js, Express.js
Database: MongoDB with Mongoose
Real-time Communication: Socket.IO
Authentication: JSON Web Tokens (jsonwebtoken), bcrypt
File Handling: Multer, Cloudinary for cloud storage
Environment: dotenv
Frontend

Framework: React (with Vite)
Routing: React Router
State Management: Redux Toolkit
HTTP Client: Axios
Real-time Communication: Socket.IO Client
Styling: Tailwind CSS
Project Structure
The repository is a monorepo containing two main directories:

backend/: Contains the Node.js/Express server, API routes, WebSocket logic, database models, and authentication middleware.
frontend/: Contains the React application, components, pages, Redux store, and utility functions for interacting with the backend.
Setup and Installation
Prerequisites
Node.js (v20.x or higher)
npm or yarn
A MongoDB database instance (local or cloud-based like MongoDB Atlas)
A Cloudinary account for image hosting
Backend Setup
Navigate to the backend directory:

cd backend
Install dependencies:

npm install
Configure Environment Variables: Create a .env file in the backend directory and add the following variables. You can use the .env.sample as a template.

PORT=8000

# JWT Secrets
ACCESS_TOKEN_SECRET=<your_access_token_secret>
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=<your_refresh_token_secret>
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
Note: The MongoDB connection string is currently hardcoded in backend/src/db/index.js. It is highly recommended to move this to your .env file and reference it using process.env.MONGODB_URI.

Run the development server:

npm run dev
The backend server will start on the port specified in your .env file (e.g., http://localhost:8000).

Frontend Setup
Navigate to the frontend directory:

cd frontend
Install dependencies:

npm install
Run the development server:

npm run dev
The frontend application will start, typically on http://localhost:5173. The vite.config.js is pre-configured to proxy API requests from /api to the backend server at http://localhost:8000.

API Endpoints
The backend exposes the following RESTful API endpoints under the /api/v1/users prefix:

| Method | Endpoint | Description | Auth Required | |--------|----------------------|--------------------------------------------|---------------| | POST | /signup | Register a new user. | No | | POST | /login | Log in a user and issue tokens. | No | | GET | /logout | Log out the current user and clear tokens. | Yes | | GET | /refresh-tokens | Refresh the access token. | Yes | | GET | /me | Get the currently logged-in user's data. | Yes | | PATCH| /password | Change the user's password. | Yes | | GET | /all | Get all registered users. | Yes | | GET | /others | Get all users except the current one. | Yes | | GET | /:userId | Get user details by their ID. | Yes | | POST | /search | Search for users by username. | Yes |

Socket.IO Events
Real-time communication is handled via the following Socket.IO events:

Client to Server
global_message: Sends a message to the global chat.
private_message: Sends a private message to a specific user.
get_global_messages: Requests a batch of historical messages from the global chat, with an optional cursor for pagination.
get_private_messages: Requests a batch of historical messages from a private chat, with an optional cursor.
Server to Client
global_message: Broadcasts a new message to all clients in the global chat.
private_message: Sends a new message to the specific participants of a private chat.

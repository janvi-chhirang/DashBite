Demo Link:-'https://dashbite-isyw.onrender.com/'

# DashBite 🍔

DashBite is a full-stack food delivery web app. Users can browse shops and food items by city, place orders, and track deliveries in real time. Shop owners can manage their menu and incoming orders, and delivery partners can accept and fulfill deliveries — all with live updates over WebSockets.

## Features

- 🔐 Email/password and Google sign-in (Firebase Auth)
- 🛍️ Browse shops and food items by city
- 🛒 Cart, checkout, and Razorpay payments
- 📦 Real-time order tracking with live location updates (Socket.IO + Leaflet maps)
- 🏪 Shop owner dashboard to manage items and orders
- 🚴 Delivery partner dashboard to accept and complete deliveries
- 📧 OTP-based password reset via email

## Tech Stack

**Frontend**
- React 19 + Vite
- Redux Toolkit
- Tailwind CSS
- Firebase Auth
- Socket.IO Client
- React Leaflet (maps)
- Axios

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT authentication (httpOnly cookies)
- Cloudinary (image uploads)
- Razorpay (payments)
- Nodemailer (OTP emails)

## Project Structure

```
DashBite/
├── frontend/     # React + Vite client
└── backend/      # Express API + Socket.IO server
```

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- A MongoDB database (local or MongoDB Atlas)
- Accounts/API keys for: Firebase, Cloudinary, Razorpay, and an email provider (for OTP emails)

### 1. Clone the repo

```bash
git clone https://github.com/janvi-chhirang/DashBite.git
cd DashBite
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:

```env
PORT=8000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL=your_email_address
EMAIL_PASSWORD=your_email_app_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Run the backend in dev mode:

```bash
npm run dev
```

The server starts on `http://localhost:8000` by default.

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/` with:

```env
VITE_SERVER_URL=http://localhost:8000
VITE_FIREBASE_APIKEY=your_firebase_api_key
VITE_GEOAPIKEY=your_geoapify_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Run the frontend in dev mode:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (Vite's default).

## Deployment

Both `frontend` and `backend` are deployed separately as two services on [Render](https://render.com).

- **Backend**: Web Service, build command `npm install`, start command `npm start` (or `node index.js`)
- **Frontend**: Static Site, build command `npm install && npm run build`, publish directory `dist`

Important notes:
- Set `VITE_SERVER_URL` on the frontend service to the backend's live Render URL — this is a **build-time** variable, so changing it requires a redeploy of the frontend.
- The backend's CORS `origin` and Socket.IO `cors.origin` must match the frontend's live URL exactly, and cookies use `sameSite: "none"` with `secure: true` since frontend and backend run on different domains.
- Add a rewrite rule on the frontend static site (`/* → /index.html`) so client-side routing works on page refresh.

## License

This project currently has no license specified.

# Workshop Registration & Confirmation App

A full-stack workshop registration system built with React, Vite, Express, and MongoDB. The app lets organizers register participants, track workshop attendance, view dashboard analytics, and print confirmation vouchers for each attendee.

## ✨ Features

- Register participants through a polished form with frontend validation
- Search, filter, and paginate participant records
- View live dashboard statistics by workshop
- Print or inspect attendee registration vouchers
- Support both MongoDB Atlas and a local fallback mode when no database URL is configured
- Send confirmation emails when SMTP settings are provided

## 🧰 Tech Stack

- Frontend: React, Vite, React Router, Tailwind CSS, Lucide icons
- Backend: Node.js, Express
- Database: MongoDB (via Mongoose) with fallback support for local data storage
- Email: Nodemailer

## 📁 Project Structure

```text
server.js                 # Starts the Express server and Vite middleware
server/
  config/
    db.js                  # Database connection logic and fallback handling
  controllers/
    participantController.js
  models/
    participant.js         # Participant schema and query helpers
  routes/
    participantRoutes.js   # API route definitions
  middleware/
    errorHandler.js        # Error handling middleware
  utils/
    email.js               # Confirmation email logic
src/
  App.jsx                  # Main router setup
  main.jsx                 # React entry point
  types.js                 # Shared workshop data
  components/
    Navbar.jsx
    LoadingSpinner.jsx
  pages/
    Dashboard.jsx          # Overview dashboard
    Register.jsx           # Registration form and voucher view
    Participants.jsx       # Searchable roster and filters
```

## ✅ Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- Optional: MongoDB Atlas connection string
- Optional: SMTP email credentials for confirmation emails

## ⚙️ Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root:

```env
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="workshops@your-org.com"
```

> Notes:
> - If `MONGODB_URI` is not provided, the app will use its fallback local storage mode.
> - If SMTP variables are missing, the app will log the email status instead of sending a real message.

## ▶️ Running the Project

### Development mode

```bash
npm run dev
```

The app will be available at:

- Frontend/API: http://localhost:3000

### Production build

```bash
npm run build
```

### Start the built app

```bash
npm run start
```

## 🔌 API Endpoints

All endpoints are prefixed with `/api`.

### POST `/api/register`
Creates a new participant registration.

Request body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1 555 123 4567",
  "workshop": "Web Development",
  "organization": "Example University"
}
```

Response:

```json
{
  "success": true,
  "message": "Registration successful!",
  "participant": {
    "_id": "...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1 555 123 4567",
    "workshop": "Web Development",
    "organization": "Example University",
    "referenceId": "REG-2026-XXXXX"
  },
  "emailStatus": "..."
}
```

### GET `/api/participants`
Returns participant data with search, filter, pagination support.

Query parameters:

- `search`
- `workshop`
- `page`
- `limit`

### GET `/api/participant/:id`
Returns a single participant by ID.

### DELETE `/api/participant/:id`
Cancels a participant registration.

### GET `/api/stats`
Returns dashboard metrics and database status.

## 🗂️ Data Model

The `participants` collection stores:

- `name`
- `email`
- `phone`
- `workshop`
- `organization`
- `registrationDate`
- `confirmationStatus`
- `referenceId`

## 🧪 Verification

You can verify the project after setup with:

```bash
npm run build
```

This builds both the React frontend and the Express server output.

## 📌 Notes

- The dashboard and participant list are designed for workshop organizers.
- The voucher page is optimized for printing after successful registration.
- The fallback mode allows testing the app even when no database is configured.


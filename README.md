🚀 BSPI BotForge - Backend Server
https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js
https://img.shields.io/badge/Express.js-4.x-000000?logo=express
https://img.shields.io/badge/MongoDB-6.x-47A248?logo=mongodb
https://img.shields.io/badge/Mongoose-8.x-880000
https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens
https://img.shields.io/badge/License-MIT-green.svg

RESTful API backend for BSPI Robotics Club Management System – handles member applications, admin dashboard, email notifications, and multi‑admin OTP authentication.

📋 Table of Contents
Overview

Tech Stack

Project Structure

Installation

Environment Variables

Database Models

API Endpoints

Student Routes

Admin Routes

Email System

Admin OTP Login

Deployment

Error Handling

Contributing

License

🎯 Overview
This is the backend server for BSPI BotForge, a complete management platform for BSPI Robotics Club. It provides RESTful APIs for:

Member application submission & status tracking

Admin authentication with email OTP (6‑digit code)

Member approval/rejection with automated email notifications

User management (roles, suspend/activate)

Transaction recording & audit logs

Blood group based member filtering

The server is built with Node.js, Express, MongoDB (Mongoose), and Nodemailer for emails.

💻 Tech Stack
Category	Technology
Runtime	Node.js (v20+)
Framework	Express.js
Database	MongoDB (Atlas or local)
ODM	Mongoose
Authentication	JWT (fallback) + Firebase Admin (optional)
Email	Nodemailer (Gmail SMTP)
File Upload	Multer + Cloudinary (image hosting)
Security	Helmet, CORS, express-rate-limit
Logging	Morgan (development)
📁 Project Structure
text
backend/
├── models/                 # Mongoose schemas
│   ├── Student.js
│   ├── User.js
│   ├── Admin.js
│   ├── AdminOTP.js
│   ├── Transaction.js
│   ├── Notification.js
│   └── Contact.js
├── controllers/            # Business logic
│   ├── studentController.js
│   ├── adminController.js
│   └── authController.js
├── routes/                 # API endpoints
│   ├── studentRoutes.js
│   ├── adminRoutes.js
│   └── authRoutes.js
├── middleware/             # Custom middleware
│   ├── adminAuth.js
│   ├── auth.js
│   └── upload.js
├── config/                 # Configuration files
│   ├── db.js               # MongoDB connection
│   ├── email.js            # Nodemailer setup
│   └── adminEmails.js      # Hardcoded admin list (fallback)
├── scripts/                # Utility scripts
│   └── addAdmin.js
├── .env                    # Environment variables
├── server.js               # Entry point
└── package.json
🔧 Installation
Prerequisites
Node.js (v20+)

MongoDB (local or Atlas)

Gmail account (for email notifications)

Cloudinary account (for photo uploads)

Steps
Clone the repository

bash
git clone 
cd bspi-botforge-backend
Install dependencies

bash
npm install
Set up environment variables – create .env file (see next section).

Start MongoDB (local) or ensure Atlas connection string is correct.

Run the server

bash
# Development (with auto‑restart)
npm run dev

# Production
npm start
The server will start on http://localhost:5000 (or the port defined in .env).

🔐 Environment Variables
Create a .env file in the root directory with the following variables:

env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/blogDB?retryWrites=true&w=majority

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_digit_app_password

# Admin emails (comma separated, for hardcoded fallback)
ADMIN_EMAILS=admin1@gmail.com,admin2@gmail.com

# Optional: JWT secret if you use token auth
JWT_SECRET=your_jwt_secret
Important – Never commit .env to version control. Add it to .gitignore.

📊 Database Models
Model	Description
Student	Member applications (name, email, roll, registration, department, session, cgpa, skills, bloodGroup, photo, status, etc.)
User	App users (Firebase UID, email, name, role, isActive)
Admin	Admin email, name, role (admin/super_admin), addedBy, lastLogin
AdminOTP	Temporary 6‑digit codes for admin login (expires after 5 minutes)
Transaction	Financial records (type, category, amount, user, paymentMethod, status)
Notification	Internal notifications for admin actions (optional)
Contact	Contact form messages (name, email, subject, message)
All models include timestamps (createdAt, updatedAt) and proper indexes.

📡 API Endpoints
Base URL
text
http://localhost:5000/api
Student Routes
Method	Endpoint	Description
POST	/students/apply	Submit membership application (multipart/form-data with photo)
GET	/students/approved	Get all approved members (supports search, department, bloodGroup, sortBy, order)
GET	/students/:id	Get single member by ID (only if status=approved)
GET	/students/status	Check application status via ?email= or ?roll=
PUT	/students/update-profile/:id	Update own profile (skills, job, phone, district, bloodGroup, bio, socialLinks) – requires X-User-Email header
PUT	/students/:id/social-links	Update only social links
POST	/students/verify-email	Verify member email before viewing profile (request body { email })
Admin Routes
Method	Endpoint	Description
GET	/admin/check-admin	Check if a user is admin (?email=)
POST	/admin/send-login-code	Send 6‑digit OTP to admin email
POST	/admin/verify-code	Verify OTP and grant access
GET	/admin/pending	Get all pending applications
GET	/admin/analytics	Get dashboard stats (totals, department count, monthly registrations)
PUT	/admin/student-action	Approve/reject student ({ id, action, rejectionReason })
GET	/admin/users	Get all users (paginated, with filters: search, role, status)
PUT	/admin/users/:id/role	Change user role (user, admin, super_admin)
PUT	/admin/users/:id/suspend	Suspend a user
PUT	/admin/users/:id/activate	Activate a suspended user
DELETE	/admin/users/:id	Delete a user
GET	/admin/admins	Get all admins
POST	/admin/admins	Add a new admin (super admin only)
DELETE	/admin/admins/:id	Remove an admin
GET	/admin/transactions	Get all transactions (supports search, type, status, page)
POST	/admin/transactions	Create a new transaction
PUT	/admin/transactions/:id	Update transaction
DELETE	/admin/transactions/:id	Delete transaction
GET	/admin/audit-logs	Get admin audit logs (actions, admin email, timestamps)
GET	/admin/contact-messages	Get contact form messages
DELETE	/admin/contact-messages/:id	Delete contact message
Note – Most admin routes require adminAuth middleware which checks the X-User-Email header against the admins collection. Super admin privileges are needed for adding/removing admins.

📧 Email System
The server uses Nodemailer with Gmail SMTP. Emails are sent in the following scenarios:

New membership application → admin email (with applicant details)

Application approved → member email (with welcome message & member directory link)

Application rejected → member email (with optional reason)

Admin login OTP → admin email (6‑digit code, expires in 5 min)

New admin added → new admin email (invitation to access admin panel)

All email templates are in config/email.js. They are responsive HTML emails with fallback plain text.

To enable email sending:

Enable 2‑Step Verification on your Gmail account.

Generate an App Password (Google Account → Security → App passwords → Mail → Other → Generate).

Set EMAIL_USER and EMAIL_PASS in .env.

🔑 Admin OTP Login Flow
Admin visits /contribute/admin (frontend).

Enters their email address → frontend calls POST /api/admin/send-login-code.

Backend checks if email exists in admins collection with isActive=true.

Generates a random 6‑digit code, stores it in AdminOTP collection (expires in 5 minutes via TTL index).

Sends the code via email.

Admin enters the code → frontend calls POST /api/admin/verify-code.

Backend validates code and deletes it.

Frontend receives success, stores a token in localStorage (or session), and redirects to /admin-dashboard.

🚢 Deployment
Deploy on Render (Recommended)
Push your backend code to a GitHub repository.

Sign in to Render.

Click New + → Web Service.

Connect your GitHub repo.

Set:

Environment: Node

Build Command: npm install

Start Command: node server.js

Add all environment variables from .env in Render dashboard.

Click Deploy.

Render will automatically restart the service if it crashes. The free tier spins down after 15 minutes of inactivity – to keep it alive, use a free uptime monitor (e.g., UptimeRobot).

Deploy on Railway
Similar steps – connect GitHub, add env variables, deploy.

Deploy on AWS / DigitalOcean (VPS)
Set up a Linux server.

Install Node.js, MongoDB, and Git.

Clone the repo, run npm install, set up .env.

Use PM2 to keep the process alive:

bash
npm install -g pm2
pm2 start server.js --name bspi-backend
pm2 save
pm2 startup
Configure a reverse proxy with Nginx (optional).

⚠️ Error Handling
The API returns consistent error responses:

json
{
  "success": false,
  "error": "Human-readable error message"
}
Common HTTP status codes:

200 – Success

201 – Resource created

400 – Bad request (validation failed)

401 – Unauthorized (missing or invalid token)

403 – Forbidden (admin only, or not your own profile)

404 – Resource not found

409 – Conflict (duplicate email/roll/registration)

500 – Internal server error

All controllers wrap logic in try/catch and log errors to console (or file in production).

🤝 Contributing
Contributions are welcome! Please follow these steps:

Fork the repository.

Create a feature branch (git checkout -b feature/amazing-feature).

Commit your changes (git commit -m 'Add amazing feature').

Push to the branch (git push origin feature/amazing-feature).

Open a Pull Request.

Please ensure your code follows the existing style and passes all tests (if any).

📄 License
This project is licensed under the MIT License. See the LICENSE file for details.

📞 Contact & Support
For issues, feature requests, or questions:

Open an issue on GitHub

Email:abdullahallmojahidstudent@gmail.com

Built with ❤️ by Abdullah all Mojahid
Empowering the next generation of robotics innovators

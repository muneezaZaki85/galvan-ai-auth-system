# Galvan AI Authentication System

A full-stack authentication system with role-based access control built for the Galvan AI technical interview.

## Tech Stack

- **Backend**: Flask RestX
- **Frontend**: Next.js with TypeScript
- **Database**: SQLite
- **Authentication**: JWT (Access & Refresh tokens)
- **Styling**: Tailwind CSS
- **Email**: Gmail SMTP for OTP verification

## Features

### Authentication
- User registration with email OTP verification
- Secure login with JWT tokens
- Password hashing with Werkzeug
- Token refresh mechanism

### Role-Based Access Control
- **Super Admin**: Predefined credentials, can manage all users
- **Regular Users**: Can access personal dashboard after email verification

### User Management (Admin Only)
- View all users
- Create new users (auto-verified)
- Delete users
- User profile management with pictures

### UI/UX
- Clean, professional, and responsive design
- Real-time form validation
- Loading states and error handling
- Mobile-friendly interface

## Project Structure

```
GalvanAI-interviewTask/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models.py          # User model and database schema
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── admin.py           # Admin user management endpoints
│   │   └── utils.py           # Email OTP utilities
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
└── frontend/
    ├── src/app/
    │   ├── login/page.tsx     # Login page
    │   ├── register/page.tsx  # Registration page
    │   ├── verify-otp/page.tsx # OTP verification
    │   ├── dashboard/page.tsx  # User dashboard
    │   └── admin/page.tsx     # Admin dashboard
    ├── package.json           # Node.js dependencies
    └── next.config.js         # Next.js configuration
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- Gmail account with app password

### Backend Setup

1. **Clone and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   Update `.env` file with your credentials:
   ```env
   JWT_SECRET_KEY=your-super-secret-jwt-key
   GMAIL_EMAIL=your-gmail@gmail.com
   GMAIL_PASSWORD=your-app-specific-password
   SUPER_ADMIN_EMAIL=admin@galvan.ai
   SUPER_ADMIN_PASSWORD=SuperAdmin123!
   ```

4. **Start Flask server:**
   ```bash
   python app.py
   ```
   Backend runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start Next.js development server:**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

## Usage

### Super Admin Access
- Email: `admin@galvan.ai`
- Password: `SuperAdmin123!`
- Access: Full user management capabilities

### User Registration Flow
1. Go to `/register`
2. Fill in all required fields
3. Check email for 6-digit OTP
4. Verify OTP at `/verify-otp`
5. Login at `/login`
6. Access personal dashboard

### Admin Features
- View all registered users
- Create new users (bypass OTP verification)
- Delete users
- Manage user profiles with pictures

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/verify-otp` - Email verification
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh

### Admin (Super Admin Only)
- `GET /admin/users` - List all users
- `POST /admin/users` - Create new user
- `GET /admin/users/{id}` - Get user details
- `PUT /admin/users/{id}` - Update user
- `DELETE /admin/users/{id}` - Delete user

## Environment Variables

### Backend (.env)
- `JWT_SECRET_KEY` - Secret key for JWT tokens
- `GMAIL_EMAIL` - Gmail address for sending OTP emails
- `GMAIL_PASSWORD` - Gmail app password
- `SUPER_ADMIN_EMAIL` - Super admin email
- `SUPER_ADMIN_PASSWORD` - Super admin password

## Security Features

- Password hashing with Werkzeug
- JWT access and refresh tokens
- Email OTP verification for user registration
- Role-based access control
- CORS enabled for frontend integration
- Input validation and error handling

## Database Schema

### User Model
- `id` - Primary key
- `profile_picture` - Image URL (optional)
- `first_name` - User's first name
- `last_name` - User's last name
- `email` - Unique email address
- `password_hash` - Hashed password
- `mobile_number` - Phone number
- `role` - User role (user/super_admin)
- `is_verified` - Email verification status
- `otp_code` - Temporary OTP for verification
- `otp_expires` - OTP expiration timestamp
- `created_at` - Account creation timestamp

## Technologies Used

**Backend:**
- Flask RestX - REST API framework
- SQLAlchemy - Database ORM
- JWT Extended - Token authentication
- CORS - Cross-origin requests
- SMTP - Email sending
- Werkzeug - Password hashing

**Frontend:**
- Next.js 14 - React framework
- TypeScript - Type safety
- Tailwind CSS - Styling
- React Hooks - State management

## Author

Developed by Muneeza Zaki for Galvan AI Technical Interview

## Submission Date

September 25, 2025
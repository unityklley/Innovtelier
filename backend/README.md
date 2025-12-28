# Legal Case Management Backend API

Secure backend API for the legal case management system with SQLite database.

## Features

- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **SQLite Database**: Lightweight, file-based database (can be upgraded to PostgreSQL)
- **RESTful API**: Clean API endpoints for all operations
- **Security**: Rate limiting, CORS, security headers
- **Data Privacy**: All data stored securely in encrypted database

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create a `.env` file in the `backend` directory:

```env
PORT=3000
NODE_ENV=development
DB_PATH=./data/legal_cases.db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
BCRYPT_ROUNDS=10
FRONTEND_URL=http://localhost:8080
```

**Important**: Change `JWT_SECRET` to a strong random string in production!

### 3. Initialize Database

The database will be automatically initialized when you start the server for the first time.

### 4. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Cases

- `GET /api/cases` - Get all cases (with optional filters: ?status=pending&search=name)
- `GET /api/cases/:id` - Get single case with files and notes
- `POST /api/cases` - Create new case
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case
- `POST /api/cases/:id/notes` - Add note to case

### Time Entries

- `GET /api/time-entries` - Get all time entries (filters: ?caseId=xxx&startDate=2024-01-01&endDate=2024-12-31)
- `POST /api/time-entries` - Create time entry
- `DELETE /api/time-entries/:id` - Delete time entry

### Expenses

- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `DELETE /api/expenses/:id` - Delete expense

### Invoices

- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice status

### Trust Transactions

- `GET /api/trust` - Get all trust transactions
- `POST /api/trust` - Create trust transaction
- `DELETE /api/trust/:id` - Delete trust transaction

## Authentication

All API endpoints (except `/api/auth/*`) require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Database Schema

The database includes the following tables:

- `users` - User accounts
- `cases` - Legal cases
- `case_files` - File attachments for cases
- `case_notes` - Notes on cases
- `time_entries` - Time tracking entries
- `expenses` - Expense records
- `invoices` - Invoice records
- `trust_transactions` - Trust account transactions

## Security Features

- **Password Hashing**: bcrypt with configurable rounds
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: Prevents abuse and brute force attacks
- **CORS Protection**: Configurable cross-origin resource sharing
- **Security Headers**: Helmet.js for additional security
- **Input Validation**: Request validation on all endpoints

## Production Deployment

For production:

1. Change `JWT_SECRET` to a strong random string
2. Set `NODE_ENV=production`
3. Use a process manager like PM2
4. Set up HTTPS/SSL
5. Configure proper CORS origins
6. Set up database backups
7. Consider upgrading to PostgreSQL for better performance

## Database Backup

The SQLite database file is located at `./data/legal_cases.db`. To backup:

```bash
cp data/legal_cases.db data/legal_cases.db.backup
```

## Troubleshooting

- **Port already in use**: Change `PORT` in `.env` file
- **Database errors**: Ensure the `data` directory exists and is writable
- **CORS errors**: Update `FRONTEND_URL` in `.env` to match your frontend URL



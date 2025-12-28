# Legal Case Management System - Setup Guide

This guide will help you set up the secure database backend for your legal case management system.

## Quick Start

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Create Environment File

Create a `.env` file in the `backend` directory:

```env
PORT=3000
NODE_ENV=development
DB_PATH=./data/legal_cases.db
JWT_SECRET=change-this-to-a-random-secret-string-in-production
JWT_EXPIRES_IN=24h
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
BCRYPT_ROUNDS=10
FRONTEND_URL=http://localhost:8080
```

**Important**: Generate a strong random string for `JWT_SECRET`. You can use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Start the Backend Server

```bash
cd backend
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 4. Create Your First User Account

1. Open `register.html` in your browser
2. Create an account with your username, email, and password
3. You'll be redirected to login

### 5. Access the System

- **Login**: `login.html`
- **Client Intake**: `client-intake.html`
- **Paralegal Dashboard**: `paralegal-dashboard.html`
- **Reports Dashboard**: `reports-dashboard.html`

## Database Location

The SQLite database is stored at: `backend/data/legal_cases.db`

## Security Features

✅ **Password Hashing**: All passwords are hashed using bcrypt  
✅ **JWT Authentication**: Secure token-based authentication  
✅ **Rate Limiting**: Prevents brute force attacks  
✅ **CORS Protection**: Configurable cross-origin protection  
✅ **Security Headers**: Additional security via Helmet.js  
✅ **Input Validation**: All inputs are validated  

## API Endpoints

All API endpoints are prefixed with `/api`:

- **Authentication**: `/api/auth/login`, `/api/auth/register`
- **Cases**: `/api/cases` (GET, POST, PUT, DELETE)
- **Time Entries**: `/api/time-entries`
- **Expenses**: `/api/expenses`
- **Invoices**: `/api/invoices`
- **Trust Transactions**: `/api/trust`

See `backend/README.md` for complete API documentation.

## Troubleshooting

### Port Already in Use
Change the `PORT` in your `.env` file to a different port (e.g., 3001)

### Database Errors
- Ensure the `backend/data` directory exists and is writable
- Check file permissions on the database file

### CORS Errors
- Update `FRONTEND_URL` in `.env` to match your frontend URL
- If running locally, use `http://localhost:8080` or your actual port

### Can't Connect to API
- Ensure the backend server is running
- Check that the API_BASE_URL in `api-client.js` matches your backend URL
- Check browser console for errors

## Production Deployment

For production use:

1. **Change JWT_SECRET**: Use a strong random string
2. **Set NODE_ENV=production**: Enables production optimizations
3. **Use HTTPS**: Set up SSL/TLS certificates
4. **Database Backups**: Regularly backup `backend/data/legal_cases.db`
5. **Process Manager**: Use PM2 or similar to keep server running
6. **Upgrade Database**: Consider PostgreSQL for better performance

## Backup Your Data

To backup your database:

```bash
cp backend/data/legal_cases.db backend/data/legal_cases.db.backup
```

## Next Steps

1. ✅ Backend server is running
2. ✅ Database is initialized
3. ✅ User account created
4. ⏳ Update frontend files to use API (see below)

### Updating Frontend to Use API

The frontend files currently use localStorage. To use the secure database:

1. Include `api-client.js` in your HTML files:
   ```html
   <script src="api-client.js"></script>
   ```

2. Replace localStorage calls with API calls:
   - `getCases()` → `casesAPI.getAll()`
   - `saveCase()` → `casesAPI.create()`
   - etc.

3. Add authentication checks:
   ```javascript
   if (!getAuthToken()) {
       window.location.href = 'login.html';
   }
   ```

## Support

For issues or questions, check:
- `backend/README.md` for API documentation
- Browser console for frontend errors
- Server logs for backend errors



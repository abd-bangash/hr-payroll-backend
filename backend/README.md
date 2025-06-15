# HR Payroll Management System Backend

A comprehensive Node.js backend application for HR Payroll Management built with Express.js and MongoDB, following MVC architecture.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (SuperAdmin, Admin, HR, Finance, Employee)
- Permission-based authorization
- Secure password hashing with bcrypt

### 👥 User Management
- SuperAdmin can create and manage all users
- Role assignment and permission management
- Password reset functionality
- User profile management

### 💼 Employee Management
- Complete employee profiles with personal and employment details
- Support for different employee types (Permanent, Contractual, Freelancer)
- Department and position tracking
- Reporting manager hierarchy

### 💰 Payroll System
- Comprehensive payroll calculation
- Support for earnings (base salary, overtime, bonuses, commissions)
- Automatic deduction calculations (tax, social security, insurance)
- Payroll approval workflow
- Payslip PDF generation
- CSV export for bank transfers

### 📊 Additional Features
- Audit logging for all system activities
- Leave management (placeholder)
- Attendance tracking (placeholder)
- Notification system (placeholder)
- Data export capabilities (CSV, PDF)

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: Joi
- **PDF Generation**: PDFKit
- **CSV Generation**: csv-writer
- **Security**: Helmet, CORS, Rate Limiting

## Project Structure

```
├── controllers/          # Request handlers
├── models/              # Mongoose schemas
├── routes/              # Express routes
├── middlewares/         # Authentication & validation
├── services/            # Business logic
├── utils/               # Helper functions
├── server.js            # Application entry point
├── package.json         # Dependencies
└── README.md           # Documentation
```

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hr-payroll-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/hr_payroll_db
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=24h
   DEFAULT_SUPERADMIN_USERNAME=superadmin
   DEFAULT_SUPERADMIN_EMAIL=superadmin@company.com
   DEFAULT_SUPERADMIN_PASSWORD=SuperAdmin123!
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Default Credentials

On first startup, a default SuperAdmin account is created:
- **Username**: superadmin
- **Email**: superadmin@company.com
- **Password**: SuperAdmin123!

**⚠️ Important**: Change the default password immediately after first login!

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### User Management (SuperAdmin only)
- `POST /api/users` - Create user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/reset-password` - Reset user password
- `DELETE /api/users/:id` - Delete user

### Employee Management
- `POST /api/employees` - Create employee
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/my-profile` - Get own profile

### Payroll Management
- `POST /api/payroll` - Create payroll entry
- `GET /api/payroll` - Get all payroll entries
- `GET /api/payroll/:id` - Get payroll by ID
- `PUT /api/payroll/:id` - Update payroll
- `POST /api/payroll/:id/approve` - Approve payroll
- `GET /api/payroll/:id/payslip` - Generate payslip PDF
- `GET /api/payroll/csv` - Generate payroll CSV
- `GET /api/payroll/my-payrolls` - Get own payrolls

### Audit Logs
- `GET /api/audit` - Get audit logs
- `GET /api/audit/stats` - Get audit statistics

## Roles & Permissions

### SuperAdmin
- Full system access
- User creation and management
- Password reset for any user
- All CRUD operations

### Admin
- User management (read/update)
- Employee management
- Payroll approval
- System monitoring

### HR
- Employee management
- Leave management
- Attendance tracking
- Basic payroll access

### Finance
- Payroll creation and management
- Financial reporting
- Bank transfer file generation

### Employee
- View own profile
- View own payrolls
- Submit leave requests
- View attendance records

## Security Features

- JWT token-based authentication
- Role-based access control
- Permission-based authorization
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Security headers with Helmet
- Input validation with Joi
- Audit logging for all actions

## Development

### Adding New Features

1. **Models**: Create Mongoose schemas in `models/`
2. **Controllers**: Add request handlers in `controllers/`
3. **Routes**: Define API endpoints in `routes/`
4. **Services**: Implement business logic in `services/`
5. **Middleware**: Add authentication/validation in `middlewares/`

### Database Schema

The application uses MongoDB with the following main collections:
- `users` - User accounts and authentication
- `employees` - Employee profiles and details
- `payrolls` - Payroll entries and calculations
- `leaves` - Leave requests and approvals
- `attendances` - Attendance records
- `notifications` - System notifications
- `auditlogs` - System audit trail

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong JWT secret
3. Configure MongoDB connection string
4. Set up proper logging
5. Configure reverse proxy (nginx)
6. Enable SSL/TLS
7. Set up monitoring and alerts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
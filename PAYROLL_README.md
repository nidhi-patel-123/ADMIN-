# Payroll Management System

A comprehensive payroll management system built with React frontend and Node.js backend, featuring modern UI design and robust functionality.

## Features

### 🎯 Core Functionality
- **Employee Payroll Management**: Create, edit, and delete individual payroll records
- **Bulk Payroll Creation**: Generate payrolls for all active employees at once
- **Payment Processing**: Mark payrolls as paid, pending, or cancelled
- **Comprehensive Calculations**: Automatic calculation of gross salary, net salary, and totals

### 💰 Salary Components
- **Basic Salary**: Core employee salary (stored in Employee model and auto-filled in payroll)
- **Allowances**: House rent, medical, transport, food, and other allowances
- **Deductions**: Tax, insurance, loan, and other deductions
- **Overtime**: Hours worked and overtime rate calculations
- **Bonus**: Additional bonus amounts

### 📊 Dashboard & Analytics
- **Real-time Statistics**: Total payrolls, net salaries, pending/paid payments
- **Filtering & Search**: Filter by month, year, payment status, and employee
- **Pagination**: Efficient data browsing with configurable page sizes
- **Sorting**: Sort by various fields in ascending/descending order

### 🔐 Security & Access Control
- **Admin Authentication**: JWT-based authentication system
- **Protected Routes**: All payroll operations require admin privileges
- **Data Validation**: Comprehensive input validation and error handling

## Backend API Endpoints

### Employee Management
- `POST /admin/employees` - Create new employee (now includes basic salary)
- `PUT /admin/employees/:id` - Update existing employee (now includes basic salary)
- `GET /admin/employees` - Get all employees (now includes basic salary)

### Payroll Management
- `GET /admin/payrolls` - Get all payrolls with pagination and filtering
- `POST /admin/payrolls` - Create new payroll (auto-uses employee basic salary if not provided)
- `PUT /admin/payrolls/:id` - Update existing payroll
- `DELETE /admin/payrolls/:id` - Delete payroll
- `GET /admin/payrolls/:id` - Get payroll by ID

### Bulk Operations
- `POST /admin/payrolls/bulk` - Create payrolls for all active employees

### Payment Processing
- `PATCH /admin/payrolls/:id/payment` - Process payment status

### Analytics & Reports
- `GET /admin/payrolls/stats` - Get payroll statistics and summaries
- `GET /admin/payrolls/employee/:employeeId/history` - Get employee payroll history

## Database Schema

### Employee Model
```javascript
{
  // ... existing fields ...
  basicSalary: {
    type: Number,
    required: [true, 'Basic salary is required'],
    min: [0, 'Basic salary cannot be negative'],
    default: 0
  }
  // ... other fields ...
}
```

### Payroll Model
```javascript
{
  employee: ObjectId,           // Reference to Employee
  month: Number,                // 1-12
  year: Number,                 // 2020-2030
  basicSalary: Number,          // Basic salary amount
  allowances: {
    houseRent: Number,
    medical: Number,
    transport: Number,
    food: Number,
    other: Number
  },
  deductions: {
    tax: Number,
    insurance: Number,
    loan: Number,
    other: Number
  },
  overtime: {
    hours: Number,
    rate: Number,
    amount: Number              // Auto-calculated
  },
  bonus: Number,
  totalAllowances: Number,      // Auto-calculated
  totalDeductions: Number,      // Auto-calculated
  grossSalary: Number,          // Auto-calculated
  netSalary: Number,            // Auto-calculated
  paymentStatus: String,        // 'pending', 'paid', 'cancelled'
  paymentDate: Date,
  paymentMethod: String,        // 'bank_transfer', 'check', 'cash'
  notes: String,
  createdBy: ObjectId,          // Reference to Admin
  createdAt: Date,
  updatedAt: Date
}
```

## Employee-Basic Salary Integration

### Employee Model Updates
- **Basic Salary Field**: Added `basicSalary` field to Employee model (required, min: 0)
- **Employee Forms**: Updated both add and edit forms to include basic salary input
- **Employee List**: Added Basic Salary column to employee table display
- **Export Functionality**: Basic salary included in CSV export

### Payroll Integration
- **Auto-fill**: Basic salary automatically populates when employee is selected in payroll form
- **Fallback Logic**: If no basic salary provided in payroll, system uses employee's stored basic salary
- **Bulk Creation**: Bulk payroll creation uses employee's basic salary as base value
- **Validation**: Ensures basic salary is always available for payroll calculations

## Frontend Components

### Main Payroll Page (`/src/pages/Payroll.jsx`)
- **Statistics Cards**: Overview of payroll metrics
- **Action Bar**: Search, filters, and action buttons
- **Data Table**: Comprehensive payroll listing with actions
- **Modals**: Add/Edit payroll, payment processing, bulk creation

### Key Features
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Automatic data refresh after operations
- **Form Validation**: Client-side validation with error messages
- **Loading States**: Skeleton loaders and loading indicators
- **Success/Error Handling**: User-friendly notifications

## Usage Instructions

### 1. Setting Employee Basic Salary
1. Go to Employees section
2. Click "Add Employee" or edit existing employee
3. Fill in the Basic Salary field (required)
4. Save employee information
5. Basic salary is now stored and will auto-fill in payroll forms

### 2. Creating Individual Payroll
1. Click "Add Payroll" button
2. Select employee from dropdown (basic salary auto-fills)
3. Modify basic salary if needed (optional)
4. Configure allowances and deductions
5. Set overtime hours/rate if applicable
6. Add bonus amount
7. Include notes if needed
8. Click "Create Payroll"

### 2. Bulk Payroll Creation
1. Click "Bulk Create" button
2. Select month and year
3. System automatically creates payrolls for all active employees
4. Review results and any errors

### 3. Processing Payments
1. Click payment icon (💰) on any payroll row
2. Select payment status (pending/paid/cancelled)
3. Choose payment method
4. Click "Process Payment"

### 4. Editing Payroll
1. Click edit icon (✏️) on any payroll row
2. Modify required fields
3. Click "Update Payroll"

### 5. Filtering & Search
- **Search**: Use search bar to find specific payrolls
- **Month Filter**: Filter by specific month
- **Year Filter**: Filter by specific year
- **Status Filter**: Filter by payment status

## Environment Variables

### Backend (`.env`)
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

### Frontend (`.env`)
```env
REACT_APP_BACKEND_URL=http://localhost:3000
```

## Installation & Setup

### Backend Setup
```bash
cd my-dashboard-backend
npm install
npm start
```

### Frontend Setup
```bash
cd my-dashboard-main
npm install
npm start
```

## Dependencies

### Backend
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- Tailwind CSS for styling
- React Icons for icons

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation of all inputs
- **SQL Injection Protection**: MongoDB with Mongoose ODM
- **CORS Configuration**: Controlled cross-origin access
- **Error Handling**: Secure error messages without data leakage

## Performance Features

- **Pagination**: Efficient data loading for large datasets
- **Database Indexing**: Optimized queries with proper indexes
- **Lazy Loading**: Components load only when needed
- **Caching**: Browser-level caching for static assets

## Future Enhancements

- **PDF Generation**: Export payroll slips and reports
- **Email Notifications**: Automated payment confirmations
- **Advanced Analytics**: Charts and trend analysis
- **Multi-currency Support**: International payroll handling
- **Tax Calculation**: Automated tax computation
- **Integration**: HR and accounting system integration

## Support & Maintenance

For technical support or feature requests, please contact the development team or create an issue in the project repository.

---

**Note**: This system is designed for internal use and should be deployed in a secure environment with proper access controls and data backup procedures.

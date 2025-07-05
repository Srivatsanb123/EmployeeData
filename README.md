# Employee Data Management System

This project is a full-stack application for managing employee data, featuring user authentication and standard CRUD (Create, Read, Update, Delete) operations.

## Features

*   **User Authentication:**
    *   **User Registration:** New users can sign up with a username and password.
    *   **User Login:** Registered users can log in to access the employee management features.
    *   **JWT-based Security:** All employee data operations are protected by JSON Web Tokens (JWT) to ensure only authenticated users can access them.
*   **Employee Management (CRUD Operations):**
    *   **Add Employee:** Register new employees with details such as name, employee ID, email, phone number, department, date of joining, date of birth, and role.
    *   **View Employees:** Display a comprehensive list of all registered employees.
    *   **Edit Employee:** Update existing employee details.
    *   **Delete Employee:** Remove employee records from the system.

## Technologies Used

**Backend:**
*   Node.js
*   Express.js (for API endpoints)
*   MySQL (database)
*   `mysql2` (MySQL client for Node.js)
*   `jsonwebtoken` (for JWT authentication)
*   `bcrypt` (for password hashing)
*   `dotenv` (for environment variables)
*   `cors` (for Cross-Origin Resource Sharing)

**Frontend:**
*   React (JavaScript library for building user interfaces)
*   Vite (Next-generation frontend tooling)
*   Axios (for making HTTP requests)
*   Tailwind CSS (for styling)

## Setup Instructions

### 1. Database Setup (MySQL)

Ensure you have a MySQL server running. The application expects a database named `employee_data` (or as configured in `backend/.env`).

### 2. Backend Setup

Navigate to the `backend` directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `backend` directory with your database credentials:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=employee_data
JWT_SECRET=supersecretjwtkey # Change this to a strong, random key in production
```

Start the backend server:

```bash
node server.js
```

The backend server will run on `http://localhost:3000`.

### 3. Frontend Setup

Navigate to the `frontend` directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The frontend application will typically run on `http://localhost:5173` (or another available port).

## Usage

1.  **Access the Application:** Open your web browser and go to the frontend URL (e.g., `http://localhost:5173`).
2.  **Register:** On the initial screen, use the registration form to create a new user account. Provide a username and password.
3.  **Login:** After successful registration (or if you already have an account), log in using your credentials.
4.  **Manage Employees:** Once logged in, you will see the employee registration form and the list of existing employees. You can now:
    *   **Add** new employee records.
    *   **View** the details of all employees in the table.
    *   **Edit** an employee's information by clicking the "Edit" button next to their entry.
    *   **Delete** an employee record by clicking the "Delete" button.
5.  **Logout:** Click the "Logout" button to end your session.
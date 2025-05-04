require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());


const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});


db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Connected to the MySQL database.");
    const createTableQuery = `CREATE TABLE IF NOT EXISTS employees (name VARCHAR(255) NOT NULL,employee_id VARCHAR(255) NOT NULL primary key, email VARCHAR(255) NOT NULL,phone_number VARCHAR(15),department
 VARCHAR(100),date_of_joining DATE,role VARCHAR(100),date_of_birth DATE);`;
    
    db.execute(createTableQuery, (err) => {
      if (err) {
        console.error("Error creating table:", err);
      } else {
        console.log("Employees table is ready.");
      }
    });
  }
});
app.post("/employees", (req, res) => {
  const {
    name,
    employee_id,
    email,
    phone_number,
    department,
    date_of_joining,
    role,
    date_of_birth,
  } = req.body;

  if (
    !name ||
    !employee_id ||
    !email ||
    !phone_number ||
    !department ||
    !date_of_joining ||
    !role ||
    !date_of_birth
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }


  const dob = new Date(date_of_birth);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  const isAdult = age > 18 || (age === 18 && today >= new Date(dob.setFullYear(today.getFullYear())));
  if (!isAdult) {
    return res.status(400).json({ message: "Employee must be at least 18 years old." });
  }


  if (!/^\w+@\w+\.\w+$/.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }


  if (!/^\d{10}$/.test(phone_number)) {
    return res.status(400).json({ message: "Phone number must be 10 digits." });
  }


  const joiningDate = new Date(date_of_joining);
  if (joiningDate > today) {
    return res.status(400).json({ message: "Date of joining cannot be in the future." });
  }


  const query =
    "INSERT INTO employees (name, employee_id, email, phone_number, department, date_of_joining, role, date_of_birth) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  db.execute(
    query,
    [
      name,
      employee_id,
      email,
      phone_number,
      department,
      date_of_joining,
      role,
      date_of_birth,
    ],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Duplicate data detected: Employee ID or Email already exists." });
        }
        console.error(err);
        return res.status(500).json({ message: "Error saving employee data." });
      }
      res.status(201).json({
        message: "Employee added successfully.",
        employeeId: result.insertId,
      });
    }
  );
});

app.get("/employees", (req, res) => {
  db.execute("SELECT * FROM employees", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error retrieving employees." });
    }
    res.status(200).json(results);
  });
});

app.get("/employees/:id", (req, res) => {
  const { id } = req.params;
  db.execute("SELECT * FROM employees WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error retrieving employee." });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Employee not found." });
    }
    res.status(200).json(result[0]);
  });
});

app.put("/employees/:id", (req, res) => {
  const { id } = req.params;
  const {
    name,
    employee_id,
    email,
    phone_number,
    department,
    date_of_joining,
    role,
  } = req.body;

  if (
    !name ||
    !employee_id ||
    !email ||
    !phone_number ||
    !department ||
    !date_of_joining ||
    !role
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const date = new Date(date_of_joining);
  const today = new Date();
  if (date > today) {
    return res
      .status(400)
      .json({ message: "Date of joining cannot be in the future." });
  }

  const query =
    "UPDATE employees SET name = ?, employee_id = ?, email = ?, phone_number = ?, department = ?, date_of_joining = ?, role = ? WHERE id = ?";
  db.execute(
    query,
    [
      name,
      employee_id,
      email,
      phone_number,
      department,
      date_of_joining,
      role,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error updating employee." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Employee not found." });
      }
      res.status(200).json({ message: "Employee updated successfully." });
    }
  );
});

app.delete("/employees/:id", (req, res) => {
  const { id } = req.params;
  db.execute("DELETE FROM employees WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error deleting employee." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Employee not found." });
    }
    res.status(200).json({ message: "Employee deleted successfully." });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

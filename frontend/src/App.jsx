import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    employee_id: "",
    email: "",
    phone_number: "",
    department: "",
    date_of_joining: "",
    date_of_birth: "",
    role: "",
  });

  const [employees, setEmployees] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchEmployees();
    }
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:3000/employees");
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        handleLogout();
      }
    }
  };

  const departments = ["HR", "Engineering", "Marketing", "Sales", "Finance"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required.";
    } else {
      const dob = new Date(formData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const ageCheckDate = new Date(dob.setFullYear(today.getFullYear()));
      if (age < 18 || (age === 18 && today < ageCheckDate)) {
        newErrors.date_of_birth = "Employee must be at least 18 years old.";
      }
    }

    if (!formData.employee_id.trim()) {
      newErrors.employee_id = "Employee ID is required.";
    } else if (!/^[a-zA-Z0-9]{1,10}$/.test(formData.employee_id)) {
      newErrors.employee_id =
        "Employee ID must be alphanumeric and max 10 characters.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^\w+@\w+\.\w+$/.test(formData.email)) {
      newErrors.email = "Invalid email format.";
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required.";
    } else if (!/^\d{10}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Phone number must be 10 digits.";
    }

    if (!formData.department) {
      newErrors.department = "Please select a department.";
    }

    if (!formData.date_of_joining) {
      newErrors.date_of_joining = "Date of joining is required.";
    } else if (new Date(formData.date_of_joining) > new Date()) {
      newErrors.date_of_joining = "Date of joining cannot be in the future.";
    }

    if (!formData.role.trim()) newErrors.role = "Role is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      const response = await axios.post("http://localhost:3000/login", {
        username,
        password,
      });
      localStorage.setItem("token", response.data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
      setIsLoggedIn(true);
      fetchEmployees();
    } catch (error) {
      setAuthError(error.response?.data?.message || "Login failed.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      const response = await axios.post("http://localhost:3000/register", {
        username,
        password,
      });
      setSuccessMessage(response.data.message);
      // Optionally, log in the user directly after registration
      // handleLogin(e);
    } catch (error) {
      setAuthError(error.response?.data?.message || "Registration failed.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setIsLoggedIn(false);
    setEmployees([]);
    setSuccessMessage("");
    setAuthError("");
    setUsername("");
    setPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");

    if (!validateForm()) return;

    try {
      if (editingEmployeeId) {
        // Update existing employee
        const response = await axios.put(
          `http://localhost:3000/employees/${editingEmployeeId}`,
          formData
        );
        setSuccessMessage(response.data.message);
        setEditingEmployeeId(null);
      } else {
        // Add new employee
        const response = await axios.post(
          "http://localhost:3000/employees",
          formData
        );
        setSuccessMessage(response.data.message);
      }
      setFormData({
        name: "",
        employee_id: "",
        email: "",
        phone_number: "",
        department: "",
        date_of_joining: "",
        date_of_birth: "",
        role: "",
      });
      fetchEmployees(); // Refresh the employee list
    } catch (error) {
      setSuccessMessage("");
      if (error.response) {
        if (
          error.response.status === 400 &&
          error.response.data.message.includes("Duplicate")
        ) {
          setErrors({
            ...errors,
            employee_id: "Employee ID already exists.",
            email: "Email already exists.",
          });
        } else {
          alert(error.response.data.message || "Error submitting the form.");
        }
      } else {
        alert("Unable to connect to the server.");
      }
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployeeId(employee.employee_id);
    setFormData({
      name: employee.name,
      employee_id: employee.employee_id,
      email: employee.email,
      phone_number: employee.phone_number,
      department: employee.department,
      date_of_joining: employee.date_of_joining.split("T")[0], // Format date for input
      date_of_birth: employee.date_of_birth.split("T")[0], // Format date for input
      role: employee.role,
    });
    setSuccessMessage("");
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        const response = await axios.delete(
          `http://localhost:3000/employees/${employeeId}`
        );
        setSuccessMessage(response.data.message);
        fetchEmployees(); // Refresh the employee list
      } catch (error) {
        setSuccessMessage("");
        alert(
          error.response?.data?.message || "Error deleting employee."
        );
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col items-center justify-center py-10 px-4">
      {!isLoggedIn ? (
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md space-y-6 border border-gray-200">
          <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-800">Login / Register</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
              />
            </div>
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-200 ease-in-out transform hover:scale-105"
            >
              Login
            </button>
          </form>
          <button
            onClick={handleRegister}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition duration-200 ease-in-out transform hover:scale-105 mt-4"
          >
            Register
          </button>
          {successMessage && (
            <p className="text-green-500 text-sm mt-4 text-center">{successMessage}</p>
          )}
        </div>
      ) : (
        <>
          <button
            onClick={handleLogout}
            className="absolute top-4 right-4 bg-red-500 text-white py-2 px-4 rounded-md shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Logout
          </button>
          <div className="w-full max-w-5xl flex flex-col items-center bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
          <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-800">Employee Registration</h1>
          <form
            className="w-full max-w-md space-y-6"
            onSubmit={handleSubmit}
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
              />
              {errors.date_of_birth && (
                <p className="text-red-500 text-sm">{errors.date_of_birth}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Employee ID</label>
              <input
                type="text"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
              />
              {errors.employee_id && (
                <p className="text-red-500 text-sm">{errors.employee_id}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
              />
              {errors.phone_number && (
                <p className="text-red-500 text-sm">{errors.phone_number}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="text-red-500 text-sm">{errors.department}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Joining</label>
              <input
                type="date"
                name="date_of_joining"
                value={formData.date_of_joining}
                onChange={handleChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
              />
              {errors.date_of_joining && (
                <p className="text-red-500 text-sm">{errors.date_of_joining}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
              />
              {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-200 ease-in-out transform hover:scale-105"
            >
              {editingEmployeeId ? "Update Employee" : "Add Employee"}
            </button>
          </form>
          {successMessage && (
            <p className="text-green-500 text-sm mt-4">{successMessage}</p>
          )}

          <h2 className="text-2xl font-bold mt-10 mb-6 text-gray-800">Employee List</h2>
          {employees.length === 0 ? (
            <p className="text-gray-600">No employees registered yet.</p>
          ) : (
            <div className="w-full overflow-x-auto rounded-lg shadow-lg border border-gray-200">
              <table className="min-w-full bg-white shadow-md rounded-lg">
                <thead>
                  <tr>
                    <th className="py-3 px-4 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-tl-lg">Name</th>
                <th className="py-3 px-4 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee ID</th>
                <th className="py-3 px-4 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="py-3 px-4 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                <th className="py-3 px-4 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                <th className="py-3 px-4 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joining Date</th>
                <th className="py-3 px-4 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="py-3 px-4 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">DOB</th>
                <th className="py-3 px-4 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.employee_id}>
                      <td className="py-3 px-4 border-b border-gray-200 text-center text-gray-700">{employee.name}</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center text-gray-700">{employee.employee_id}</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center text-gray-700">{employee.email}</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center text-gray-700">{employee.phone_number}</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center text-gray-700">{employee.department}</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center text-gray-700">{new Date(employee.date_of_joining).toLocaleDateString()}</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center text-gray-700">{employee.role}</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center text-gray-700">{new Date(employee.date_of_birth).toLocaleDateString()}</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-md text-sm mr-2 hover:bg-yellow-600 transition duration-200 ease-in-out transform hover:scale-105"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(employee.employee_id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600 transition duration-200 ease-in-out transform hover:scale-105"
                    >
                      Delete
                    </button>
                  </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </>
      )}
    </div>
  );
}

export default App;

import { useState } from "react";
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

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");

    if (!validateForm()) return;

    try {
      const response = await axios.post(
        "http://localhost:3000/employees",
        formData
      );
      setSuccessMessage(response.data.message);
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
    } catch (error) {
      setSuccessMessage("");
      if (error.response) {
        if (error.response.status === 400 && error.response.data.message.includes("Duplicate")) {
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

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 py-6">
      <h1 className="text-2xl font-bold mb-6">Employee Registration</h1>
      <form
        className="bg-white p-6 shadow-md rounded-lg w-80 space-y-4"
        onSubmit={handleSubmit}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.date_of_birth && (
            <p className="text-red-500 text-sm">{errors.date_of_birth}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Employee ID</label>
          <input
            type="text"
            name="employee_id"
            value={formData.employee_id}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.employee_id && (
            <p className="text-red-500 text-sm">{errors.employee_id}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="text"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.phone_number && (
            <p className="text-red-500 text-sm">{errors.phone_number}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
          <label className="block text-sm font-medium text-gray-700">Date of Joining</label>
          <input
            type="date"
            name="date_of_joining"
            value={formData.date_of_joining}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.date_of_joining && (
            <p className="text-red-500 text-sm">{errors.date_of_joining}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Submit
        </button>
      </form>
      {successMessage && (
        <p className="text-green-500 text-sm mt-4">{successMessage}</p>
      )}
    </div>
  );
}

export default App;

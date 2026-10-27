import { useState } from "react";
import axios from "axios";

function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:3000/signup",
        formData,
        { withCredentials: true }
      );

      alert(res.data);
    } catch (err) {
      alert(err.response?.data || "Signup failed");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-base-200 p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h1 className="text-3xl font-bold text-center text-primary">
            Join DevTinder 💜
          </h1>

          <form onSubmit={handleSignup} className="space-y-3">
            <input
              name="firstName"
              placeholder="First name"
              className="input input-bordered w-full"
              value={formData.firstName}
              onChange={handleChange}
              required
            />

            <input
              name="lastName"
              placeholder="Last name"
              className="input input-bordered w-full"
              value={formData.lastName}
              onChange={handleChange}
              required
            />

            <input
              name="emailId"
              type="email"
              placeholder="Email"
              className="input input-bordered w-full"
              value={formData.emailId}
              onChange={handleChange}
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              className="input input-bordered w-full"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button className="btn btn-primary w-full" type="submit">
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
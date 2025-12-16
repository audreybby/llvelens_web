import React, { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const db = getFirestore();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      // Buat akun Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // Simpan user ke Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
        role: "user",
        createdAt: new Date(),
        photo: "", // kosong dulu
      });

      alert("User Registered Successfully!");
      navigate("/Login");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[28rem]">
        <h2 className="text-3xl font-bold text-center mb-12 text-biru">
          Register
        </h2>

        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 mb-6 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-biru"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-6 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-biru"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-6 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-biru"
            required
          />

          <button
            type="submit"
            className="w-full p-3 text-base bg-biru text-white rounded-full hover:bg-biru transition mb-3"
          >
            Register
          </button>
        </form>

        <div className="text-center mt-6">
          <span className="text-gray-500">
            Already have an account?{" "}
            <Link
              to="/Login"
              className="underline text-biru hover:text-birumuda"
            >
              Login
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React, { useState, useEffect } from "react"; 
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Product from './pages/Product';
import Register from './components/Register';
import Signin from './components/Login';
import AdminDashboard from './pages/AdminDashboard';
import OrderForm from './pages/FormPesanan';
import Profile from './pages/Profile';
import OrdersSection from './components/PesananCRUD';
import Portfolio from './pages/Portofolio';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [navHeight, setNavHeight] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Navbar setNavHeight={setNavHeight} />

      <div style={{ paddingTop: navHeight }}> 
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product" element={<Product />} />
          <Route path="/Pesanan" element={<OrderForm />} /> 
          <Route path="/Login" element={<Signin />} /> 
          <Route path="/Register" element={<Register />} /> 
          <Route path="/Admin" element={<AdminDashboard />} /> 
          <Route path="/Profile" element={<Profile />} />
          <Route path="/AdminOrder" element={<OrdersSection />} />
          <Route path="/Portfolio" element={<Portfolio />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

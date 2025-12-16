import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Navbar({ setNavHeight }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  const navRef = useRef(null); // ⬅️ TAMBAHAN PENTING

  useEffect(() => {
    if (navRef.current) {
      setNavHeight(navRef.current.offsetHeight);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setRole(docSnap.data().role);
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUserClick = () => {
    if (!user) navigate("/Login");
    else if (role === "admin") navigate("/Admin");
    else navigate("/Profile");
  };

  return (
    <nav
      ref={navRef}
      className="w-full bg-white shadow flex justify-between items-center px-6 py-4 fixed top-0 left-0 z-50"
    >
      <h1 className="text-2xl font-bold font-aclonica text-biru">LLVELENS</h1>

      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-8">
        <a href="/" className="text-biru font-aclonica hover:underline">Home</a>
        <a href="/Product" className="text-biru font-aclonica hover:underline">Product</a>
        <a href="#" className="text-biru font-aclonica hover:underline">Contact Us</a>
      </div>

      <div className="flex items-center space-x-6 text-biru">
        <Icon icon="gg:profile" width="38" height="38" onClick={handleUserClick} />
        <Icon icon="mingcute:basket-2-line" width="38" height="38" />
      </div>
    </nav>
  );
}

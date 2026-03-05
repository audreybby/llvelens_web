import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Navbar({ setNavHeight }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const navRef = useRef(null);

  // Set navbar height
  useEffect(() => {
    if (navRef.current) {
      setNavHeight(navRef.current.offsetHeight);
    }
  }, [setNavHeight]);

  // Auth state
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
    setMenuOpen(false);
    if (!user) navigate("/Login");
    else if (role === "admin") navigate("/Admin");
    else navigate("/Profile");
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <>
      <nav
        ref={navRef}
        className="w-full bg-white shadow flex justify-between items-center px-6 py-4 fixed top-0 left-0 z-50"
      >
        {/* LOGO */}
        <h1
          onClick={() => handleNavigate("/")}
          className="text-2xl font-bold font-aclonica text-biru cursor-pointer"
        >
          LLVELENS
        </h1>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center space-x-8">
          <button onClick={() => handleNavigate("/")} className="text-biru font-aclonica hover:underline">
            Home
          </button>
          <button onClick={() => handleNavigate("/Product")} className="text-biru font-aclonica hover:underline">
            Product
          </button>
          <button onClick={() => handleNavigate("/Contact")} className="text-biru font-aclonica hover:underline">
            Contact Us
          </button>
        </div>

        {/* RIGHT ICON */}
        <div className="flex items-center space-x-4 text-biru">
          <Icon
            icon="gg:profile"
            width="32"
            height="32"
            className="cursor-pointer"
            onClick={handleUserClick}
          />

          {/* HAMBURGER (Mobile Only) */}
          <div className="md:hidden">
            <Icon
              icon={menuOpen ? "mdi:close" : "mdi:menu"}
              width="32"
              height="32"
              className="cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
            />
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden fixed top-[72px] left-0 w-full bg-white shadow-md z-40 flex flex-col items-center py-6 space-y-6 animate-slideDown">
          <button
            onClick={() => handleNavigate("/")}
            className="text-biru font-aclonica text-lg"
          >
            Home
          </button>

          <button
            onClick={() => handleNavigate("/Product")}
            className="text-biru font-aclonica text-lg"
          >
            Product
          </button>

          <button
            onClick={() => handleNavigate("/Contact")}
            className="text-biru font-aclonica text-lg"
          >
            Contact Us
          </button>
        </div>
      )}
    </>
  );
}
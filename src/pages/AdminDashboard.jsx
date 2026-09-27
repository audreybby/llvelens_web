import React, { useState } from "react";
import ProductsCRUD from "../components/ProductsCRUD";
import PortfolioCRUD from "../components/PortfolioCRUD";
import OrderCRUD from "../components/PesananCRUD";
import History from "./History";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function AdminDashboard() {
  const [section, setSection] = useState("products");

  const MenuItem = ({ id, icon, label }) => (
    <button
      onClick={() => setSection(id)}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 
        ${
          section === id
            ? "bg-white/20 text-white backdrop-blur-lg shadow-lg border border-white/10"
            : "text-gray-300 hover:bg-white/10"
        }
      `}
    >
      {icon}
      <span className="text-base font-medium">{label}</span>
    </button>
  );

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/Login";
  };

  return (
    <div className="w-full h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">

      <aside className="fixed top-0 left-0 h-screen w-64 border-r border-white/10 p-6 flex flex-col">
        <nav className="flex flex-col gap-3 mt-20">
          <MenuItem
            id="products"
            label="Produk"
            icon={<i className="fa-solid fa-box text-lg"></i>}
          />
          <MenuItem
            id="portfolio"
            label="Portofolio"
            icon={<i className="fa-solid fa-images text-lg"></i>}
          />
          <MenuItem
            id="orders"
            label="Pesanan"
            icon={<i className="fa-solid fa-cart-shopping text-lg"></i>}
          />
          <MenuItem
            id="history"
            label="History"
            icon={<i className="fa-solid fa-clock-rotate-left text-lg"></i>}
          />
          <button
            style={{
              padding: "8px 20px",
              borderRadius: "10px",
              background: "#ff4d4d",
              color: "white",
              marginTop: "10px",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
            }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 ml-64 p-10 overflow-y-auto">
        <div className="rounded-2xl p-8 shadow-2xl border border-white/10">
          {section === "products" && <ProductsCRUD />}
          {section === "portfolio" && <PortfolioCRUD />}
          {section === "orders" && <OrderCRUD />}
          {section === "history" && <History />}
        </div>
      </main>
    </div>
  );
}

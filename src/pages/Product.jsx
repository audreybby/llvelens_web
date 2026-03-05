import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

export default function ProductsSection() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(fetched);
    });

    return () => unsub();
  }, []);

  const handleOrderClick = (product) => {
    if (!user) {
      setShowLoginPopup(true);
      return;
    }
    navigate("/Pesanan", { state: { product } });
  };

  const detailProduct = (product) => {
    if (!user) {
      setShowLoginPopup(true);
      return;
    }
    navigate(`/product/${product.id}`, { state: { product } });
  };

  return (
    <section className="w-full">
      {/* ================= HEADER ================= */}
      <div className="bg-[#6BA3D6] py-10 md:py-12 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-aclonica text-white drop-shadow-md">
          Our Products
        </h2>
      </div>

      {/* ================= PRODUCT LIST ================= */}
      <div className="bg-[#F7FAFF] py-12 md:py-16 flex flex-col items-center">
        <div className="w-full max-w-3xl flex flex-col gap-6 md:gap-8 px-4">
          {products.length === 0 ? (
            <p className="text-gray-500 text-center font-poppins">
              Loading products...
            </p>
          ) : (
            products.map((item) => (
              <div
                key={item.id}
                className="
                  bg-[#6BA3D6] text-white rounded-xl shadow-md
                  flex flex-col md:flex-row
                  justify-between items-start md:items-center
                  gap-6 md:gap-0
                  px-6 sm:px-8 md:px-10
                  py-6 md:py-8
                "
              >
                {/* PRODUCT INFO */}
                <div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-aclonica drop-shadow-sm">
                    &gt; {item.category}
                  </h3>

                  <p className="text-lg sm:text-xl md:text-2xl font-poppins mt-2">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(item.price)}
                  </p>
                </div>

                {/* BUTTON GROUP */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto">
                  <button
                    onClick={() => detailProduct(item)}
                    className="
                      bg-[#E9EEF7] text-[#1D3557] font-poppins
                      w-full md:w-auto
                      px-6 sm:px-10 md:px-16
                      py-2
                      rounded-md shadow-sm
                      hover:bg-[#D5E2EE] transition
                    "
                  >
                    Detail
                  </button>

                  <button
                    onClick={() => handleOrderClick(item)}
                    className="
                      bg-[#E9EEF7] text-[#1D3557] font-poppins
                      w-full md:w-auto
                      px-6 sm:px-10 md:px-16
                      py-2
                      rounded-md shadow-sm
                      hover:bg-[#D5E2EE] transition
                    "
                  >
                    Pesan Sekarang
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ================= LOGIN POPUP ================= */}
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
            <h3 className="font-poppins text-base sm:text-lg font-semibold mb-3">
              Harus Login Terlebih Dahulu
            </h3>

            <p className="text-gray-600 text-sm mb-5">
              Kamu harus login sebelum bisa melakukan pemesanan.
            </p>

            <button
              onClick={() =>
                navigate("/Login", { state: { from: "/Products" } })
              }
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition mb-2"
            >
              Login Sekarang
            </button>

            <button
              onClick={() => setShowLoginPopup(false)}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
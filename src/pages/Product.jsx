import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

export default function ProductsSection() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [search, setSearch] = useState("");
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

    navigate("/Pesanan", {
      state: {
        productId: product.id,
        title: product.title,
        price: product.price,
        category: product.category,
      },
    });
  };

  const detailProduct = (product) => {
    if (!user) {
      setShowLoginPopup(true);
      return;
    }

    navigate(`/product/${product.id}`);
  };

  const filteredProducts = products.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="w-full">

      {/* HEADER */}
      <div className="bg-[#6BA3D6] py-12 text-center">
        <h2 className="text-3xl font-aclonica text-white">Our Products</h2>
      </div>

      {/* CONTENT */}
      <div className="bg-[#F7FAFF] py-8 flex justify-center">
        <div className="w-full max-w-6xl px-4">

          {/* SEARCH */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-1/2 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
            />
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

            {filteredProducts.length === 0 ? (
              <p className="text-gray-500 text-center col-span-full">
                Produk tidak ditemukan
              </p>
            ) : (
              filteredProducts.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-[#1D3557]">
                      {item.title}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {item.category}
                    </p>

                    <p className="text-lg font-bold text-[#457B9D] mt-3">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(item.price)}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={() => detailProduct(item)}
                      className="flex-1 border border-[#457B9D] text-[#457B9D] py-2 rounded-lg text-sm hover:bg-[#457B9D] hover:text-white transition"
                    >
                      Detail
                    </button>

                    <button
                      onClick={() => handleOrderClick(item)}
                      className="flex-1 bg-[#457B9D] text-white py-2 rounded-lg text-sm hover:bg-[#1D3557] transition"
                    >
                      Order
                    </button>
                  </div>
                </div>
              ))
            )}

          </div>
        </div>
      </div>

      {showLoginPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 text-center w-80">

            <h3 className="font-semibold mb-3">
              Harus Login Terlebih Dahulu
            </h3>

            <p className="text-gray-600 text-sm mb-4">
              Kamu harus login sebelum bisa melakukan pemesanan.
            </p>

            <button
              onClick={() => navigate("/Login")}
              className="w-full bg-blue-600 text-white py-2 rounded mb-2"
            >
              Login Sekarang
            </button>

            <button
              onClick={() => setShowLoginPopup(false)}
              className="w-full bg-gray-200 py-2 rounded"
            >
              Batal
            </button>

          </div>
        </div>
      )}
    </section>
  );
}
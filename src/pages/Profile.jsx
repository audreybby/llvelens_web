import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function Profile() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/Login";
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(data);
    });

    return () => unsub();
  }, [user]);

  const openDetail = (order) => {
    setSelectedOrder(order);
    setShowPopup(true);
  };

  const closeDetail = () => {
    setShowPopup(false);
    setSelectedOrder(null);
  };

  const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(value));

  return (
    <div className="bg-[#F4F6FA] min-h-screen pb-20">
      <div className="w-full bg-[#79A9D1] pb-10 pt-10">
        <div className="flex flex-col items-center text-white">
          <div className="w-24 h-24 bg-gray-300 rounded-full mb-4"></div>
          <h2 className="text-lg font-semibold">
            {user?.username || "User"}
          </h2>
          <p className="text-sm">{user?.email}</p>

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
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-10">
        <h2 className="text-2xl text-biru font-aclonica font-semibold mb-6">Pesanan :</h2>

        {orders.length === 0 && (
          <p className="text-gray-500">Belum ada pesanan.</p>
        )}

        {orders.map((item) => (
          <div
            key={item.id}
            className="bg-[#79A9D1] text-white p-6 rounded-lg shadow-md mb-8"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xl font-semibold leading-tight">
                  &gt; {item.productType}
                </p>
                <p className="mt-3">{formatRupiah(item.price)}</p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="bg-white text-black px-4 py-1 rounded-md text-xs">
                  Status Pesanan :{" "}
                  <span className="text-green-600 font-semibold">
                    {item.status}
                  </span>
                </div>

                <button
                  className="bg-white text-black px-4 py-1 rounded-md text-xs"
                  onClick={() => openDetail(item)}
                >
                  Detail Pesanan
                </button>

                <button
                  className="bg-white text-black px-4 py-1 rounded-md text-xs text-center"
                >
                  Preview
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showPopup && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center px-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-[#79A9D1]">
              Detail Pesanan
            </h2>

            <p><strong>Pesanan:</strong> {selectedOrder.productType}</p>
            <p><strong>Harga:</strong> {formatRupiah(selectedOrder.price)}</p>
            <p><strong>Status:</strong> {selectedOrder.status}</p>
            <p className="mt-2">
              <strong>Detail Pesanan:</strong> <br />
              {selectedOrder.details || "Tidak ada deskripsi."}
            </p>

            {selectedOrder.previewUrl && (
              <img
                src={selectedOrder.previewUrl}
                alt="Preview"
                className="w-full rounded-md mt-4"
              />
            )}

            <button
              onClick={closeDetail}
              className="mt-6 bg-[#79A9D1] text-white px-6 py-2 rounded-md w-full"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

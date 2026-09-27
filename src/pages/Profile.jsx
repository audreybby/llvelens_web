import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDoc
} from "firebase/firestore";

const STEPS = [
  "pending",
  "approved",
  "process",
  "process_done",
  "revisi",
  "approved_final",
  "completed"
];

export default function Profile() {

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [activeImage, setActiveImage] = useState(null);
  const [revisionMessage, setRevisionMessage] = useState("");

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

    const fetchUser = async () => {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUsername(docSnap.data().username);
      }
    };

    fetchUser();
  }, [user]);

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
    setActiveImage(null);
  };

  const closeDetail = () => {
    setShowPopup(false);
    setSelectedOrder(null);
    setActiveImage(null);
  };

  const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(value));

  const isCompleted = selectedOrder?.status === "completed";
  const revisionCount = selectedOrder?.revisionCount || 0;

  const ProgressTracker = ({ status }) => {
  const currentIndex = STEPS.indexOf(status);

    return (
      <div className="w-full mt-6">
        <div className="relative flex justify-between items-center">
          <div className="absolute top-4 left-0 w-full h-[2px] bg-gray-200"></div>

          {STEPS.map((step, index) => {

            let circle = "bg-gray-300";
            let text = "text-gray-400";

            if (index < currentIndex) {
              circle = "bg-green-500";
              text = "text-green-600";
            }

            if (index === currentIndex) {
              circle = "bg-[#6BA3D6]";
              text = "text-[#1D3557]";
            }

            return (
              <div key={step} className="relative flex flex-col items-center w-full">
                <div className={`w-8 h-8 rounded-full ${circle} text-white flex items-center justify-center text-xs z-10`}>
                  {index + 1}
                </div>
                <p className={`text-[10px] mt-2 capitalize ${text}`}>
                  {step}
                </p>
              </div>
            );
          })}

        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#F7FAFF] min-h-screen pb-20">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#6BA3D6] to-[#1D3557] text-white">
        <div className="max-w-4xl mx-auto px-6 py-8 flex justify-between items-center">

          <div>
            <h1 className="text-2xl font-bold">
              {username || "Username"}
            </h1>
            <p className="text-sm text-white/80 mt-1">
              {user?.email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm"
          >
            Logout
          </button>

        </div>
      </div>

      {/* ORDERS */}
      <div className="max-w-4xl mx-auto px-6 mt-10">

        <h2 className="text-2xl font-semibold text-[#1D3557] mb-6">
          Pesanan Saya
        </h2>

        {orders.length === 0 && (
          <p className="text-gray-500">Belum ada pesanan.</p>
        )}

        {orders.map((item) => (
          <div
            key={item.id}
            className="bg-white p-5 rounded-xl shadow-sm mb-5"
          >

            <div className="flex justify-between items-center">

              <div>
                <p className="text-sm text-[#6BA3D6] font-semibold">
                  {item.productCategory}
                </p>

                <p className="text-lg font-semibold text-[#1D3557]">
                  {item.productType}
                </p>

                <p className="mt-2 text-gray-600">
                  {formatRupiah(item.price)}
                </p>
              </div>

              <div className="flex flex-col gap-2 items-end">

                <span className="text-xs bg-[#E9EEF7] px-3 py-1 rounded-full">
                  {item.status}
                </span>

                <button
                  className="text-sm bg-[#6BA3D6] text-white px-4 py-1 rounded-lg"
                  onClick={() => openDetail(item)}
                >
                  Detail
                </button>

              </div>

            </div>

          </div>
        ))}

      </div>

      {/* POPUP */}
      {showPopup && selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">

            <h2 className="text-xl font-semibold text-center text-[#1D3557]">
              Detail Pesanan
            </h2>

            <ProgressTracker status={selectedOrder.status} />

            {/* BUTTON GAMBAR */}
            <div className="mt-6 flex gap-2 flex-wrap">

              {selectedOrder.result1 && (
                <button
                  onClick={() => setActiveImage(selectedOrder.result1)}
                  className="px-4 py-2 bg-blue-500 text-white rounded text-xs"
                >
                  Result Awal
                </button>
              )}

              {/* REVISI 1 */}
              <button
                onClick={() => selectedOrder.revisi1 && setActiveImage(selectedOrder.revisi1)}
                disabled={!selectedOrder.revisi1}
                className={`px-4 py-2 rounded text-xs ${
                  selectedOrder.revisi1
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Revisi 1
              </button>

              {/* REVISI 2 */}
              <button
                onClick={() => selectedOrder.revisi2 && setActiveImage(selectedOrder.revisi2)}
                disabled={!selectedOrder.revisi2}
                className={`px-4 py-2 rounded text-xs ${
                  selectedOrder.revisi2
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Revisi 2
              </button>
            </div>

            {/* PREVIEW */}
            {activeImage && (
              <img
                src={activeImage}
                className="mt-4 rounded-lg border"
              />
            )}

            <p className="text-xs text-gray-500 mt-2">
              Revisi digunakan: {
                (selectedOrder.revisi2 && 2) ||
                (selectedOrder.revisi1 && 1) ||
                0
              } / 2
            </p>

            {/* CHAT REVISI USER */}
            {selectedOrder.status === "process_done" && !isCompleted && (
              <div className="mt-4 flex gap-2">

                <button
                  onClick={async () => {
                    await updateDoc(doc(db, "orders", selectedOrder.id), {
                      status: "revisi"
                    });

                    setSelectedOrder(prev => ({
                      ...prev,
                      status: "revisi"
                    }));
                  }}
                  className="px-4 py-2 bg-yellow-500 text-white rounded text-sm"
                >
                  Ajukan Revisi
                </button>

                <button
                  onClick={async () => {
                    await updateDoc(doc(db, "orders", selectedOrder.id), {
                      status: "completed"
                    });

                    setSelectedOrder(prev => ({
                      ...prev,
                      status: "completed"
                    }));
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded text-sm"
                >
                  Setuju (Final)
                </button>
              </div>
            )}

            {selectedOrder.status === "revisi" && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border space-y-4">

                <div>
                  <p className="text-sm font-semibold mb-2">
                    Chat Revisi
                  </p>

                  <div className="bg-white border rounded p-3 h-32 overflow-y-auto text-sm space-y-1">

                    {selectedOrder.revisionMessages?.map((msg, i) => (
                      <div key={i}>
                        <span className={`font-semibold ${
                          msg.sender === "user"
                            ? "text-blue-600"
                            : "text-green-600"
                        }`}>
                          {msg.sender}:
                        </span>{" "}
                        {msg.text}
                      </div>
                    ))}

                    {!selectedOrder.revisionMessages?.length && (
                      <p className="text-gray-400 text-xs">
                        Belum ada pesan revisi
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 mt-2">
                    <input
                      value={revisionMessage}
                      onChange={(e) => setRevisionMessage(e.target.value)}
                      placeholder="Tulis revisi..."
                      className="flex-1 border px-3 py-2 rounded text-sm"
                    />

                    <button
                      onClick={async () => {
                        if (!revisionMessage.trim()) return;

                        const newMessage = {
                          sender: "user",
                          text: revisionMessage,
                          time: Date.now(),
                        };

                        await updateDoc(doc(db, "orders", selectedOrder.id), {
                          revisionMessages: [
                            ...(selectedOrder.revisionMessages || []),
                            newMessage
                          ]
                        });

                        setSelectedOrder(prev => ({
                          ...prev,
                          revisionMessages: [
                            ...(prev.revisionMessages || []),
                            newMessage
                          ]
                        }));

                        setRevisionMessage("");
                      }}
                      className="px-4 py-2 bg-[#6BA3D6] text-white rounded text-sm"
                    >
                      Kirim
                    </button>
                  </div>

                </div>

              </div>
            )}

            {/* 🔥 BUTTON PILIHAN USER */}
            {(
              selectedOrder.revisi1 &&
              !selectedOrder.revisi2 &&
              !isCompleted
            ) && (
              <div className="mt-6 flex gap-3">

                <button
                  onClick={async () => {
                    if (revisionCount >= 2) return;

                    await updateDoc(doc(db, "orders", selectedOrder.id), {
                      status: "revisi",
                      revisionCount: 2
                    });

                    setSelectedOrder(prev => ({
                      ...prev,
                      status: "revisi",
                      revisionCount: 2
                    }));
                  }}
                  className="flex-1 bg-yellow-500 text-white py-2 rounded-lg"
                >
                  Revisi Lagi
                </button>

                <button
                  onClick={async () => {
                    await updateDoc(doc(db, "orders", selectedOrder.id), {
                      status: "completed"
                    });

                    setSelectedOrder(prev => ({
                      ...prev,
                      status: "completed"
                    }));
                  }}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg"
                >
                  Selesai (Final)
                </button>

              </div>
            )}

            {selectedOrder.revisi2 && !isCompleted && (
              <div className="mt-6">

                <p className="text-xs text-red-500 mb-2">
                  Batas revisi sudah habis (2x)
                </p>

                <button
                  onClick={async () => {
                    await updateDoc(doc(db, "orders", selectedOrder.id), {
                      status: "completed"
                    });

                    setSelectedOrder(prev => ({
                      ...prev,
                      status: "completed"
                    }));
                  }}
                  className="w-full bg-green-500 text-white py-2 rounded-lg"
                >
                  Selesai (Final)
                </button>

              </div>
            )}

            {/* FINAL RESULT */}
            {selectedOrder.status === "completed" && selectedOrder.finalFile && (
              <div className="mt-6">

                <a
                  href={selectedOrder.finalFile}
                  download="final-design.png"
                  className="block w-full text-center bg-green-600 text-white py-2 rounded-lg"
                >
                  Download Final Design
                </a>

              </div>
            )}

            <button
              onClick={closeDetail}
              className="mt-6 w-full bg-[#6BA3D6] text-white py-2 rounded-lg"
            >
              Tutup
            </button>

          </div>

        </div>
      )}
    </div>
  );
}
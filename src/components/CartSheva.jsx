import React, { useState, useEffect } from "react";
import { FaMinus, FaPlus, FaTimes } from "react-icons/fa";
import { db } from "../firebase";
import {
  getDocs,
  collection,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import QR from "../assets/bg 5.jpg";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [metodeBayar, setMetodeBayar] = useState("");
  const [pesananSelesai, setPesananSelesai] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [paymentProof, setPaymentProof] = useState(null);

  useEffect(() => {
    let uid = localStorage.getItem("userId");
    if (!uid) {
      uid = "guest-" + Math.random().toString(36).substring(2, 10);
      localStorage.setItem("userId", uid);
    }
    loadCart();
  }, []);
  
  const compressImageToBase64 = (file, maxWidth = 800, quality = 0.6) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedBase64);
        };

        img.onerror = reject;
      };

      reader.onerror = reject;
    });
  };

  const loadCart = async () => {
    const userId = localStorage.getItem("userId") || "guest";
    try {
      const ref = collection(db, "cart", userId, "items");
      const snap = await getDocs(ref);
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCartItems(data);
    } catch (err) {
      console.error("Gagal load cart:", err);
    }
  };

  const updateQuantity = async (id, change) => {
    const userId = localStorage.getItem("userId") || "guest";
    const ref = doc(db, "cart", userId, "items", id);

    const currentQty =
      cartItems.find((item) => item.id === id)?.quantity || 1;
    const newQty = Math.max(1, currentQty + change);

    await updateDoc(ref, { quantity: newQty });

    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: newQty } : item
      )
    );
  };

  const removeItem = async (id) => {
    const userId = localStorage.getItem("userId") || "guest";
    await deleteDoc(doc(db, "cart", userId, "items", id));
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const clearCart = async () => {
    const userId = localStorage.getItem("userId") || "guest";
    for (const item of cartItems) {
      await deleteDoc(doc(db, "cart", userId, "items", item.id));
    }
    setCartItems([]);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  const totalItems = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  const formatRupiah = (num) =>
    num.toLocaleString("id-ID", { style: "currency", currency: "IDR" });

  const handlePaymentImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const compressed = await compressImageToBase64(file);
    setPaymentProof(compressed);
    setPreviewImg(compressed);
  };

  const handleSelesaiPembayaran = async () => {
    const userId = localStorage.getItem("userId") || "guest";

    await addDoc(collection(db, "orders", userId, "orderList"), {
      nama,
      noHp,
      alamat,
      metode: metodeBayar,
      total: subtotal,
      items: cartItems,
      paymentProof: metodeBayar === "QRIS" ? paymentProof : null,
      status: metodeBayar === "COD" ? "Belum Dibayar" : "Menunggu Konfirmasi",
      createdAt: serverTimestamp(),
    });

    await clearCart();
    setShowQR(false);
    setShowCheckout(false);
    setPesananSelesai(true);
  };

  if (pesananSelesai) {
    return (
      <div className="max-w-md mx-auto text-center p-8 rounded-lg shadow-md mt-24">
        <h2 className="text-2xl font-bold text-green-600 mb-3">
          ✅ Pembayaran Berhasil!
        </h2>
        <p className="mb-4">
          Terima kasih {nama}, pesanan kamu sedang diproses.
        </p>
        <button
          className="mt-6 bg-yellow-500 text-white px-6 py-2 rounded-lg"
          onClick={() => setPesananSelesai(false)}
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mt-24 mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-center text-yellow-600">
        Keranjang Belanja
      </h1>

        <div className="grid md:grid-cols-3 gap-8 mt-8">
          {/* LIST */}
          <div className="md:col-span-2">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-4 border-b"
              >
                <div className="flex items-center gap-3">
                  <button onClick={() => removeItem(item.id)}>
                    <FaTimes />
                  </button>
                  <img
                    src={item.img}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p>{formatRupiah(item.price)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, -1)}>
                    <FaMinus />
                  </button>
                  <span>{item.quantity || 1}</span>
                  <button onClick={() => updateQuantity(item.id, 1)}>
                    <FaPlus />
                  </button>
                </div>

                <p className="font-semibold">
                  {formatRupiah(item.price * (item.quantity || 1))}
                </p>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="text-red-500 mt-4 font-semibold"
            >
              Kosongkan Keranjang
            </button>
          </div>

          {/* SUMMARY */}
          <div className="border rounded-lg p-6 h-fit">
            <h2 className="font-bold text-lg mb-4">Ringkasan</h2>
            <p>Total Item: {totalItems}</p>
            <p>Subtotal: {formatRupiah(subtotal)}</p>
            <button
              onClick={() => setShowCheckout(true)}
              className="mt-4 w-full bg-yellow-500 text-white py-2 rounded"
            >
              Lanjut ke Pembayaran
            </button>
          </div>
        </div>

      {/* CHECKOUT */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[400px]">
            <h2 className="text-xl font-bold mb-4">Konfirmasi Pesanan</h2>

            <input
              placeholder="Nama lengkap"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full p-2 border mb-3"
            />

            <input
              placeholder="No HP"
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              className="w-full p-2 border mb-3"
            />

            <label className="flex gap-2 mb-2">
              <input
                type="radio"
                checked={metodeBayar === "COD"}
                onChange={() => setMetodeBayar("COD")}
              />
              COD
            </label>

            <label className="flex gap-2">
              <input
                type="radio"
                checked={metodeBayar === "QRIS"}
                onChange={() => setMetodeBayar("QRIS")}
              />
              QRIS
            </label>

            <div className="flex justify-between mt-4">
              <button onClick={() => setShowCheckout(false)}>Batal</button>
              <button
                className="bg-yellow-500 text-white px-4 py-2 rounded"
                onClick={() =>
                  metodeBayar === "QRIS"
                    ? setShowQR(true)
                    : handleSelesaiPembayaran()
                }
              >
                Lanjut
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QRIS */}
      {showQR && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[350px] text-center">
            <h2 className="font-bold mb-4">Scan QR</h2>
            <img src={QR} className="w-48 mx-auto mb-4" />

            <input type="file" onChange={handlePaymentImage} />
            {previewImg && (
              <img src={previewImg} className="w-32 mx-auto mt-3 rounded" />
            )}

            <button
              className="w-full bg-green-500 text-white py-2 rounded mt-4"
              onClick={handleSelesaiPembayaran}
            >
              Saya sudah bayar
            </button>

            <button
              className="w-full bg-gray-300 py-2 rounded mt-2"
              onClick={() => setShowQR(false)}
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

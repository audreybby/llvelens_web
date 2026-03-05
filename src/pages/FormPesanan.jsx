import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";

export default function OrderForm() {
  const location = useLocation();
  const selectedProduct = location.state?.product || null;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    productType: selectedProduct?.name || "",
    details: "",
    reference: "",
    price: selectedProduct?.price || 0,
    paymentProof: "",
  });

  const [loadingUser, setLoadingUser] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [previewImg, setPreviewImg] = useState(null);
  const [previewRef, setPreviewRef] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData((prev) => ({
              ...prev,
              name: data.name || "",
              email: data.email || currentUser.email,
              phone: data.phone || "",
            }));
          }
        } catch (err) {
          setError("Gagal memuat data pengguna.");
        }
      }
      setLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });
  };

  const handlePaymentImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const base64 = await handleImageToBase64(file);

    setFormData((prev) => ({ ...prev, paymentProof: base64 }));
    setPreviewImg(base64);
  };

  const handleReferenceImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const base64 = await handleImageToBase64(file);

    setFormData((prev) => ({ ...prev, reference: base64 }));
    setPreviewRef(base64);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await addDoc(collection(db, "orders"), {
        ...formData,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        status: "pending",
      });

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Gagal mengirim pesanan.");
    }
  };

  if (loadingUser) {
    return (
      <div className="text-center py-10 text-gray-500">
        Memuat data pengguna...
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="p-6 text-center bg-green-50 rounded-2xl shadow-md mt-10 max-w-lg mx-auto">
        <h2 className="text-2xl font-semibold text-green-600 mb-2">
          Pemesanan Berhasil!
        </h2>
        <p className="text-gray-600">Tunggu pesanan anda dikonfirmasi.</p>
        <button
          className="mt-4 px-6 py-2 bg-biru text-white rounded-xl"
          onClick={() =>navigate("/product")}
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto bg-white shadow-lg rounded-2xl p-6 mt-10 space-y-4 border border-gray-200"
    >
      <h2 className="text-2xl font-bold text-center mb-4 text-biru font-aclonica">
        Formulir Pemesanan
      </h2>

      {error && <p className="text-center text-red-500">{error}</p>}

      <div>
        <label className="font-medium">Nama</label>
        <input
          value={formData.name}
          readOnly
          className="w-full bg-gray-100 px-3 py-2 rounded-xl"
        />
      </div>

      <div>
        <label className="font-medium">Email</label>
        <input
          value={formData.email}
          readOnly
          className="w-full bg-gray-100 px-3 py-2 rounded-xl"
        />
      </div>

      <div>
        <label className="font-medium">Nomor Telepon</label>
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded-xl"
        />
      </div>

      <div>
        <label className="font-medium">Produk</label>
        <input
          value={formData.productType}
          readOnly
          className="w-full bg-gray-100 px-3 py-2 rounded-xl"
        />
      </div>

      <div>
        <label className="font-medium">Harga</label>
        <input
          value={`Rp ${formData.price}`}
          readOnly
          className="w-full bg-gray-100 px-3 py-2 rounded-xl"
        />
      </div>

      <div>
        <label className="font-medium">Detail Pesanan</label>
        <textarea
          name="details"
          value={formData.details}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded-xl h-24 resize-none"
        />
      </div>

      <div>
        <label className="font-medium">Upload Referensi</label>
        <input
          type="file"
          accept="image/*"
          required
          onChange={handleReferenceImage}
          className="w-full"
        />

        {previewRef && (
          <img
            src={previewRef}
            className="w-full rounded-xl mt-3 border"
            alt="preview"
          />
        )}
      </div>

      <div>
        <label className="font-medium">Pembayaran (QRIS)</label>

        <img
          src="/qris.png"
          className="w-full rounded-xl border mt-1"
          alt="QRIS"
        />

        <p className="text-gray-600 text-sm mt-1">
          Silakan scan QRIS dan upload bukti pembayaran.
        </p>
      </div>

      <div>
        <label className="font-medium">Upload Bukti Pembayaran</label>
        <input
          type="file"
          accept="image/*"
          required
          onChange={handlePaymentImage}
          className="w-full"
        />

        {previewImg && (
          <img
            src={previewImg}
            className="w-full rounded-xl mt-3 border"
            alt="preview"
          />
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-biru text-white py-2 rounded-xl font-semibold"
      >
        Kirim Pemesanan
      </button>
    </form>
  );
}

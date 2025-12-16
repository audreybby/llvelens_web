import React from "react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const statuses = [
  "pending",
  "approved",
  "process",
  "revisi",
  "completed",
  "rejected",
];

export default function OrderModal({ order, close }) {
  if (!order) return null;

  const updateStatus = async (status) => {
    await updateDoc(doc(db, "orders", order.id), { status });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 w-96 rounded shadow relative">
        <h2 className="text-xl font-bold mb-4">Detail Pesanan</h2>

        <button className="absolute right-4 top-3" onClick={close}>
          ✕
        </button>

        <p><b>Nama:</b> {order.name || "-"}</p>
        <p><b>Email:</b> {order.email || "-"}</p>
        <p><b>No Telp:</b> {order.phone || "-"}</p>
        <p><b>Produk:</b> {order.productType || "-"}</p>
        <p><b>Detail:</b> {order.details || "-"}</p>

        {order.paymentProof && (
          <img
            src={order.paymentProof}
            className="w-full rounded mt-3 shadow"
            alt="payment"
          />
        )}

        <div className="mt-4">
          <b>Ubah Status:</b>
          <select
            className="w-full border p-2 mt-2 rounded"
            defaultValue={order.status}
            onChange={(e) => updateStatus(e.target.value)}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <button
          className="w-full bg-gray-700 text-white p-2 mt-4 rounded"
          onClick={close}
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

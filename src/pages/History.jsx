import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  where,
  updateDoc
} from "firebase/firestore";
import { db } from "../firebase";

const BADGE_STYLES = {
  rejected: "bg-red-100 text-red-800 border border-red-200",
  completed: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  default: "bg-gray-100 text-gray-800 border border-gray-200",
};

export default function History() {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [zoomSrc, setZoomSrc] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("isArchived", "==", true),
      orderBy("movedAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setHistory(list);
    });

    return () => unsub();
  }, []);

  const deleteHistory = async (id) => {
    const confirmDelete = confirm("Hapus permanen data ini?");
    if (!confirmDelete) return;

    await updateDoc(doc(db, "orders", id), {
      isDeleted: true
    });

    setSelected(null);
  };

  const openDetails = (order) => {
    setSelected(order);
    document.body.style.overflow = "hidden";
  };

  const closeDetails = () => {
    setSelected(null);
    document.body.style.overflow = "";
  };

  const openZoom = (src) => {
    setZoomSrc(src);
    document.body.style.overflow = "hidden";
  };

  const closeZoom = () => {
    setZoomSrc(null);
    document.body.style.overflow = "";
  };

  return (
    <div className="text-white p-6">
      <h2 className="text-xl font-semibold mb-6">History Pesanan</h2>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <div className="min-w-full bg-white/5 rounded-2xl border border-white/10">

          {/* HEADER */}
          <div className="hidden md:grid grid-cols-12 px-6 py-4 text-gray-300 text-sm border-b border-white/10">
            <div className="col-span-3">Nama</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Produk</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Aksi</div>
          </div>

          {/* ROW */}
          <div className="divide-y divide-white/10">
            {history.map((o) => {
              const badge =
                BADGE_STYLES[o.status] || BADGE_STYLES.default;

              return (
                <div
                  key={o.id}
                  className="grid md:grid-cols-12 px-6 py-4 gap-4 items-center"
                >
                  <div className="md:col-span-3">{o.username}</div>
                  <div className="md:col-span-3 text-sm text-gray-300">
                    {o.email}
                  </div>
                  <div className="md:col-span-2">{o.productType}</div>

                  <div className="md:col-span-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${badge}`}
                    >
                      {o.status}
                    </span>
                  </div>

                  <div className="md:col-span-2 text-right">
                    <button
                      onClick={() => openDetails(o)}
                      className="px-3 py-1 bg-white/10 rounded"
                    >
                      Detail
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* POPUP DETAIL */}
      {selected && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={closeDetails}
          />

          <div className="relative bg-slate-800 p-6 rounded-xl w-full max-w-lg">
            <h3 className="text-lg mb-4">Detail History</h3>

            <p><b>Nama:</b> {selected.username}</p>
            <p><b>Email:</b> {selected.email}</p>
            <p><b>Produk:</b> {selected.productType}</p>
            <p><b>Status:</b> {selected.status}</p>
            <p className="whitespace-pre-line">
              <b>Detail:</b> {selected.details}
            </p>

            {/* BUKTI */}
            {selected.paymentProof && (
              <img
                src={selected.paymentProof}
                className="w-32 mt-4 cursor-pointer"
                onClick={() => openZoom(selected.paymentProof)}
              />
            )}

            <div className="flex justify-between mt-6">
              <button
                onClick={() => deleteHistory(selected.id)}
                className="bg-red-500 px-4 py-2 rounded"
              >
                Hapus Permanen
              </button>

              <button
                onClick={closeDetails}
                className="bg-gray-500 px-4 py-2 rounded"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ZOOM IMAGE */}
      {zoomSrc && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={closeZoom}
          />
          <img src={zoomSrc} className="max-w-[90%] max-h-[90%]" />
        </div>
      )}
    </div>
  );
}
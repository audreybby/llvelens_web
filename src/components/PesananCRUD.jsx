import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

const BADGE_STYLES = {
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  approved: "bg-green-100 text-green-800 border border-green-200",
  rejected: "bg-red-100 text-red-800 border border-red-200",
  process: "bg-blue-100 text-blue-800 border border-blue-200",
  revisi: "bg-purple-100 text-purple-800 border border-purple-200",
  completed: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  default: "bg-gray-100 text-gray-800 border border-gray-200",
};

const ALL_STATUSES = [
  "pending",
  "approved",
  "process",
  "revisi",
  "completed",
  "rejected",
];

export default function OrdersSection() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [zoomSrc, setZoomSrc] = useState(null);

  // 🔥 state untuk panel upload
  const [showRevisionUpload, setShowRevisionUpload] = useState(false);
  const [showFinalUpload, setShowFinalUpload] = useState(false);
  const [revisionMessage, setRevisionMessage] = useState("");
  const [showProcessUpload, setShowProcessUpload] = useState(false);

  // 🔥 realtime fetch
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(list);
    });

    return () => unsub();
  }, []);

  // 🔥 update status normal
  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "orders", id), { status });

    setSelected((prev) => ({ ...prev, status }));
  };

  // 🔥 klik status handler
  const handleStatusClick = (status) => {
  if (status === "process") {
    // ❌ tidak boleh kembali ke process jika sudah lewat
    if (selected.status !== "pending" && selected.status !== "approved") {
      alert("Status tidak bisa kembali ke process.");
      return;
    }

    setShowProcessUpload(true);
    setShowRevisionUpload(false);
    setShowFinalUpload(false);
    return;
  }

  if (status === "revisi") {
    if ((selected.revisionCount || 0) >= 2) {
      alert("Kesempatan revisi sudah habis.");
      return;
    }
    setShowRevisionUpload(true);
    setShowProcessUpload(false);
    setShowFinalUpload(false);
    return;
  }

  if (status === "completed") {
    setShowFinalUpload(true);
    setShowRevisionUpload(false);
    setShowProcessUpload(false);
    return;
  }

  updateStatus(selected.id, status);
};

  // 🔥 upload revisi
  const uploadRevisionFile = async (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;

      const newCount = (selected.revisionCount || 0) + 1;

      await updateDoc(doc(db, "orders", selected.id), {
        status: "revisi",
        revisionCount: newCount,
        revisionFiles: [...(selected.revisionFiles || []), base64],
      });

      setSelected((prev) => ({
        ...prev,
        status: "revisi",
        revisionCount: newCount,
        revisionFiles: [...(prev.revisionFiles || []), base64],
      }));

      setShowRevisionUpload(false);
      alert("Revisi berhasil dikirim");
    };

    reader.readAsDataURL(file);
  };

  // 🔥 kirim pesan revisi (customer tracking)
const sendRevisionMessage = async () => {
  if (!revisionMessage.trim()) return;

  const messageData = {
    text: revisionMessage,
    sender: "designer",
    time: Date.now(),
  };

  await updateDoc(doc(db, "orders", selected.id), {
    revisionMessages: [...(selected.revisionMessages || []), messageData],
  });

  setSelected((prev) => ({
    ...prev,
    revisionMessages: [...(prev.revisionMessages || []), messageData],
  }));

  setRevisionMessage("");
};

// 🔥 upload file saat process → otomatis revisi
const uploadProcessFile = async (file) => {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    const base64 = reader.result;

    await updateDoc(doc(db, "orders", selected.id), {
      processFiles: [...(selected.processFiles || []), base64],
      status: "revisi", // 🔥 otomatis jadi revisi
    });

    setSelected((prev) => ({
      ...prev,
      processFiles: [...(prev.processFiles || []), base64],
      status: "revisi",
    }));

    setShowProcessUpload(false);
    alert("File process dikirim ke client, status berubah ke revisi");
  };

  reader.readAsDataURL(file);
};

  // 🔥 upload final design
  const uploadFinalDesign = async (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;

      await updateDoc(doc(db, "orders", selected.id), {
        finalFile: base64,
        status: "completed",
      });

      setSelected((prev) => ({
        ...prev,
        finalFile: base64,
        status: "completed",
      }));

      setShowFinalUpload(false);
      alert("Design final berhasil dikirim");
    };

    reader.readAsDataURL(file);
  };

  const openDetails = (order) => {
    setSelected(order);
    document.body.style.overflow = "hidden";
  };

  const closeDetails = () => {
    setSelected(null);
    setShowRevisionUpload(false);
    setShowFinalUpload(false);
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
    <div className="text-white">
      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto">
        <div className="min-w-full bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">

          {/* HEADER */}
          <div className="hidden md:grid grid-cols-12 px-6 py-4 text-gray-300 text-sm font-medium border-b border-white/10">
            <div className="col-span-3">Nama</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Produk</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Aksi</div>
          </div>

          {/* ROWS */}
          <div className="divide-y divide-white/10">
            {orders.map((o) => {
              const badge = BADGE_STYLES[o.status] || BADGE_STYLES.default;

              return (
                <div
                  key={o.id}
                  className="grid grid-cols-1 md:grid-cols-12 px-6 py-4 gap-4 items-center hover:bg-white/5 transition"
                >
                  <div className="md:col-span-3">
                    <p className="text-xs text-gray-400 md:hidden">Nama</p>
                    <p className="font-medium">{o.name}</p>
                  </div>

                  <div className="md:col-span-3">
                    <p className="text-xs text-gray-400 md:hidden">Email</p>
                    <p className="break-all text-sm text-gray-200">{o.email}</p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-400 md:hidden">Produk</p>
                    <p>{o.productType}</p>
                  </div>

                  <div className="md:col-span-2">
                    <span className={`px-3 py-1 rounded-full text-xs ${badge}`}>
                      {o.status}
                    </span>
                  </div>

                  <div className="md:col-span-2 md:text-right">
                    <button
                      onClick={() => openDetails(o)}
                      className="px-4 py-1.5 rounded-lg text-sm bg-white/10 hover:bg-white/20"
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= POPUP ================= */}
      {selected && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/60" onClick={closeDetails} />

          <div className="relative bg-slate-800 rounded-xl w-full max-w-xl p-6 max-h-[90vh] overflow-auto">
            <div className="flex justify-between mb-6">
              <h3 className="text-lg font-semibold">Detail Pesanan</h3>
              <button onClick={closeDetails}>✕</button>
            </div>

            {/* CUSTOMER */}
            <div className="mb-6">
              <h4 className="text-gray-400 mb-2">Customer</h4>
              <p><b>Nama:</b> {selected.name}</p>
              <p><b>Email:</b> {selected.email}</p>
              <p><b>Telepon:</b> {selected.phone}</p>
            </div>

            {/* DETAIL */}
            <div className="mb-6">
              <h4 className="text-gray-400 mb-2">Detail</h4>
              <p><b>Produk:</b> {selected.productType}</p>
              <p className="whitespace-pre-line">{selected.details}</p>
            </div>

            {/* BUKTI */}
            <div className="mb-6">
              <h4 className="text-gray-400 mb-2">Bukti Pembayaran</h4>
              {selected.paymentProof && (
                <img
                  src={selected.paymentProof}
                  className="w-32 h-32 object-contain border rounded cursor-pointer"
                  onClick={() => openZoom(selected.paymentProof)}
                />
              )}
            </div>

            {/* STATUS */}
            <div className="mb-6">
              <h4 className="text-gray-400 mb-2">Progress</h4>

              {ALL_STATUSES.map((s, i) => {
                const isActive = selected.status === s;

                return (
                  <div key={s}>
                    <button
                      onClick={() => handleStatusClick(s)}
                      className={`text-left px-4 py-2 rounded-lg border w-full mb-2
                        ${BADGE_STYLES[s]}
                        ${isActive ? "ring-2 ring-white" : "opacity-70 hover:opacity-100"}
                      `}
                    >
                      {i + 1}. {s}
                    </button>

{/* 🟡 PANEL PROCESS */}
{s === "process" && showProcessUpload && (
  <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
    <p className="text-xs text-gray-400 mb-2">
      Upload hasil sementara untuk client
    </p>
    <input
      type="file"
      onChange={(e) => uploadProcessFile(e.target.files[0])}
    />
  </div>
)}

{/* 🔵 PANEL REVISI */}
{s === "revisi" && showRevisionUpload && (
  <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10 space-y-4">

    {/* Upload */}
    <div>
      <p className="text-xs text-gray-400 mb-2">
        Upload revisi ({selected.revisionCount || 0}/2)
      </p>
      <input
        type="file"
        onChange={(e) => uploadRevisionFile(e.target.files[0])}
      />
    </div>

    {/* Chat Revisi */}
    <div>
      <p className="text-xs text-gray-400 mb-2">Pesan Revisi</p>

      <div className="bg-black/30 rounded p-2 h-28 overflow-y-auto text-sm space-y-1">
        {selected.revisionMessages?.map((msg, i) => (
          <div key={i}>
            <span className="text-blue-300 font-semibold">
              {msg.sender}:
            </span>{" "}
            {msg.text}
          </div>
        ))}

        {!selected.revisionMessages?.length && (
          <p className="text-gray-500 text-xs">Belum ada pesan revisi</p>
        )}
      </div>

      <div className="flex gap-2 mt-2">
        <input
          value={revisionMessage}
          onChange={(e) => setRevisionMessage(e.target.value)}
          placeholder="Tulis pesan revisi..."
          className="flex-1 px-2 py-1 rounded bg-white/10 text-sm"
        />
        <button
          onClick={sendRevisionMessage}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-sm"
        >
          Kirim
        </button>
      </div>
    </div>

    {/* Riwayat File Revisi */}
    {selected.revisionFiles?.length > 0 && (
      <div>
        <p className="text-xs text-gray-400 mb-2">Riwayat Revisi</p>
        <div className="flex gap-2 flex-wrap">
          {selected.revisionFiles.map((img, i) => (
            <img
              key={i}
              src={img}
              className="w-14 h-14 object-contain border rounded cursor-pointer"
              onClick={() => openZoom(img)}
            />
          ))}
        </div>
      </div>
    )}

  </div>
)}

                    {/* 🟢 PANEL FINAL */}
                    {s === "completed" && showFinalUpload && (
                      <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-xs text-gray-400 mb-2">
                          Upload design final
                        </p>
                        <input
                          type="file"
                          onChange={(e) => uploadFinalDesign(e.target.files[0])}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ZOOM */}
      {zoomSrc && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/70" onClick={closeZoom} />
          <img src={zoomSrc} className="max-w-[90%] max-h-[90%]" />
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  query,
  orderBy,
  deleteDoc,
  setDoc,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { where } from "firebase/firestore";

const BADGE_STYLES = {
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  approved: "bg-green-100 text-green-800 border border-green-200",
  rejected: "bg-red-100 text-red-800 border border-red-200",
  process: "bg-blue-100 text-blue-800 border border-blue-200",
  process_done: "bg-cyan-100 text-cyan-800 border border-cyan-200",
  revisi: "bg-purple-100 text-purple-800 border border-purple-200",
  completed: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  default: "bg-gray-100 text-gray-800 border border-gray-200",
};

const ALL_STATUSES = [
  "pending",
  "approved",
  "process",
  "process_done",
  "revisi",
  "completed",
  "rejected",
];

const compressImageToBase64 = (file, maxWidth = 800, targetSize = 300000) => {
  return new Promise((resolve, reject) => {

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {

      const img = new Image();
      img.src = event.target.result;

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

        let quality = 0.8;
        let base64 = canvas.toDataURL("image/jpeg", quality);

        while (base64.length > targetSize && quality > 0.1) {
          quality -= 0.1;
          base64 = canvas.toDataURL("image/jpeg", quality);
        }

        resolve(base64);
      };

      img.onerror = reject;
    };

    reader.onerror = reject;
  });
};

export default function OrdersSection() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [zoomSrc, setZoomSrc] = useState(null);

  // 🔥 state untuk panel upload
  const [showRevisionUpload, setShowRevisionUpload] = useState(false);
  const [showFinalUpload, setShowFinalUpload] = useState(false);
  const [revisionMessage, setRevisionMessage] = useState("");
  const [showProcessUpload, setShowProcessUpload] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("isArchived", "==", false),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(list);
    });

    return () => unsub();
  }, []);

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "orders", id), { status });

    setSelected((prev) => ({ ...prev, status }));
  };

  const handleStatusClick = async (status) => {
    if (status === "rejected") {
      const confirmReject = confirm("Yakin ingin reject pesanan ini?");
      if (!confirmReject) return;

      await updateDoc(doc(db, "orders", selected.id), {
        status: "rejected",
        isArchived: true,
        movedAt: Date.now()
      });

      setSelected(null);
      return;
    }

    if (status === "process") {
      if (selected.status !== "approved") {
        alert("Process hanya bisa dimulai setelah approved.");
        return;
      }

      updateStatus(selected.id, "process");
      return;
    }

    if (status === "process_done") {
      if (selected.status !== "process") {
        alert("Process Done hanya bisa setelah process.");
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

 
  const uploadRevisionFile = async (file) => {
    if (!file) return;

    const currentCount = selected.revisionCount || 0;

    if (currentCount >= 2) {
      alert("Revisi sudah maksimal (2x)");
      return;
    }

    const base64 = await compressImageToBase64(file);

    const field = currentCount === 0 ? "revisi1" : "revisi2";

    const newCount = currentCount + 1;

    await updateDoc(doc(db, "orders", selected.id), {
      [field]: base64,
      status: "revisi",
      revisionCount: newCount
    });
  
    setSelected((prev) => ({
      ...prev,
      [field]: base64,
      status: "revisi",
      revisionCount: newCount
    }));

    setShowRevisionUpload(false);

    alert(`Revisi berhasil dikirim (${field})`);
  };

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


  const uploadProcessFile = async (file) => {
    if (!file) return;

    const base64 = await compressImageToBase64(file);

    await updateDoc(doc(db, "orders", selected.id), {
      result1: base64,
      status: "process_done"
    });

    setSelected((prev) => ({
      ...prev,
      result1: base64,
      status: "process_done"
    }));

    setShowProcessUpload(false);

    alert("Design berhasil dikirim ke client");
  };

  const uploadFinalDesign = async (file) => {
    if (!file) return;

    const base64 = await compressImageToBase64(file);

    const orderRef = doc(db, "orders", selected.id);
    const snap = await getDoc(orderRef);

    if (!snap.exists()) return;

    const data = snap.data();

    await updateDoc(doc(db, "orders", selected.id), {
      finalFile: base64,
      status: "completed",
      isArchived: true,
      movedAt: Date.now()
    });

    setSelected(null);
    setShowFinalUpload(false);

    alert("Final design dikirim & pesanan masuk ke history");
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
      {/* TABEL PESANAN */}
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

          {/* ISI TABEL */}
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
                    <p className="font-medium">{o.username}</p>
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

      {/* POPUP */}
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
              <p><b>Nama:</b> {selected.username}</p>
              <p><b>Email:</b> {selected.email}</p>
              <p><b>Telepon:</b> {selected.phone}</p>
            </div>

            {/* DETAIL */}
            <div className="mb-6">
              <h4 className="text-gray-400 mb-2">Detail</h4>
              <p><b>Category:</b> {selected.productCategory}</p>

              <p><b>Produk:</b> {selected.productType}</p>
              <p className="whitespace-pre-line"><b>Details:</b> {selected.details}</p>
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

          {/* PANEL PROCESS */}
          {s === "process_done" && showProcessUpload && (
            <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-xs text-gray-400 mb-2">
              Upload hasil design untuk client review
              </p>
              <input
                type="file"
                onChange={(e) => uploadProcessFile(e.target.files[0])}
              />
            </div>
          )}

          {/* PANEL REVISI */}
          {s === "revisi" && showRevisionUpload && (
            <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10 space-y-4">

              {/* UPLOAD */}
              <div>
                <p className="text-xs text-gray-400 mb-2">
                  Upload revisi ({selected.revisionCount || 0}/2)
                </p>
                <input
                  type="file"
                  onChange={(e) => uploadRevisionFile(e.target.files[0])}
                />
              </div>

              {/* CHAT REVISI */}
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

              {/* RIWAYAT REVISI */}
              {(selected.revisi1 || selected.revisi2) && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Riwayat Revisi</p>

                  <div className="flex gap-2 flex-wrap">

                    {selected.revisi1 && (
                      <img
                        src={selected.revisi1}
                        className="w-14 h-14 object-contain border rounded cursor-pointer"
                        onClick={() => openZoom(selected.revisi1)}
                      />
                    )}

                    {selected.revisi2 && (
                      <img
                        src={selected.revisi2}
                        className="w-14 h-14 object-contain border rounded cursor-pointer"
                        onClick={() => openZoom(selected.revisi2)}
                      />
                    )}

                  </div>
                </div>
              )}
              </div>
            )}

          {/* PANEL COMPLETED */}
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
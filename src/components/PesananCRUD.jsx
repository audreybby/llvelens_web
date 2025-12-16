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
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("newest");
  const [selected, setSelected] = useState(null);
  const [zoomSrc, setZoomSrc] = useState(null);
  const itemsPerPage = 7;
  const [page, setPage] = useState(1);

  useEffect(() => {
    let q;
    try {
      q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    } catch {
      q = collection(db, "orders");
    }

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setOrders(list);
      },
      (err) => {
        console.error("orders snapshot error:", err);
        setOrders([]);
      }
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil((orders?.length || 0) / itemsPerPage));
    if (page > totalPages) setPage(totalPages);
  }, [orders, page]);

  const filtered = (orders || []).filter((o) => {
    const q = (search || "").toLowerCase().trim();
    if (!q) return true;
    return (
      (o.name || "").toLowerCase().includes(q) ||
      (o.email || "").toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortType === "newest") return (b.createdAt || 0) - (a.createdAt || 0);
    if (sortType === "oldest") return (a.createdAt || 0) - (b.createdAt || 0);
    if (sortType === "status") return (a.status || "").localeCompare(b.status || "");
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const pageData = sorted.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "orders", id), { status });
      setSelected(null);
    } catch (err) {
      console.error("Failed updating status:", err);
      alert("Gagal mengupdate status. Coba lagi.");
    }
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
    <div className="text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Pesanan Masuk</h2>
          <p className="text-sm text-gray-300">Kelola pesanan pelanggan.</p>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search name / email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 placeholder:text-gray-300 text-sm"
          />

          <select
            value={sortType}
            onChange={(e) => {
              setSortType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">

          <div className="hidden md:grid grid-cols-12 px-4 py-3 text-gray-300 text-sm">
            <div className="col-span-3">Nama</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Produk</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Detail</div>
          </div>

          <div className="divide-y divide-white/10">
            {pageData.length === 0 ? (
              <p className="p-6 text-center text-gray-400">Tidak ada pesanan ditemukan.</p>
            ) : (
              pageData.map((o) => {
                const badge = BADGE_STYLES[o.status] || BADGE_STYLES.default;
                return (
                  <div
                    key={o.id}
                    className="grid grid-cols-1 md:grid-cols-12 px-4 py-4 gap-3 hover:bg-white/5 transition"
                  >
                    <div className="md:col-span-3">
                      <p className="text-xs md:hidden text-gray-400">Nama</p>
                      <p>{o.name || "-"}</p>
                    </div>

                    <div className="md:col-span-3">
                      <p className="text-xs md:hidden text-gray-400">Email</p>
                      <p>{o.email || "-"}</p>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-xs md:hidden text-gray-400">Produk</p>
                      <p>{o.productType || "-"}</p>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-xs md:hidden text-gray-400">Status</p>
                      <span className={`px-3 py-1 rounded-full text-xs ${badge}`}>
                        {o.status || "pending"}
                      </span>
                    </div>

                    <div className="md:col-span-2 text-right">
                      <button
                        onClick={() => openDetails(o)}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm"
                      >
                        Lihat
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-300">
          Menampilkan {Math.min((page - 1) * itemsPerPage + 1, Math.max(0, sorted.length))}–
          {Math.min(page * itemsPerPage, sorted.length)} dari {sorted.length} hasil
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className={`px-3 py-1 rounded ${page <= 1 ? "bg-white/5 text-gray-400" : "bg-white/10"}`}
          >
            Prev
          </button>

          <div className="px-3 py-1 text-sm border rounded bg-white/5">
            {page} / {totalPages}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className={`px-3 py-1 rounded ${page >= totalPages ? "bg-white/5 text-gray-400" : "bg-white/10"}`}
          >
            Next
          </button>
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeDetails}
          />

          <div className="relative bg-slate-800 rounded-xl w-full max-w-lg p-6 border border-white/10 shadow-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Detail Pesanan</h3>
              <button
                onClick={closeDetails}
                className="text-gray-300 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Nama</p>
                <p>{selected.name || "-"}</p>
              </div>

              <div>
                <p className="text-gray-400 text-xs">Email</p>
                <p>{selected.email || "-"}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-400 text-xs">No Telp</p>
                  <p>{selected.phone || "-"}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-xs">Produk</p>
                  <p>{selected.productType || "-"}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-xs">Detail</p>
                <p className="whitespace-pre-line">{selected.details || "-"}</p>
              </div>

              <div>
                <p className="text-gray-400 text-xs mb-1">Bukti Pembayaran</p>
                {selected.paymentProof ? (
                  <img
                    src={selected.paymentProof}
                    alt="payment proof"
                    className="w-full max-h-60 object-contain rounded-lg border border-white/10 cursor-pointer"
                    onClick={() => openZoom(selected.paymentProof)}
                  />
                ) : (
                  <p className="text-gray-500">Tidak ada bukti pembayaran</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {ALL_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selected.id, s)}
                    className={`px-3 py-1.5 rounded-md text-xs ${BADGE_STYLES[s]}`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <button
                onClick={closeDetails}
                className="w-full mt-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {zoomSrc && (
        <div className="fixed inset-0 z-[110000] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={closeZoom}
          />
          <img
            src={zoomSrc}
            alt="zoom"
            className="relative max-w-[92%] max-h-[92%] rounded-lg shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}

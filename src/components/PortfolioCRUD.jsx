import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";

const categories = ["Logo", "Poster", "Feed Instagram", "Banner", "UI Design"];

function PortfolioCRUD() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    title: "",
    category: "",
    image: "",
    createdAt: serverTimestamp(),
  });
  const [editId, setEditId] = useState(null);

  const portfolioRef = collection(db, "portfolio");

const convertToBase64 = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target.result;

    img.onload = () => {
      const canvas = document.createElement("canvas");

      const MAX_WIDTH = 600;
      const scaleSize = MAX_WIDTH / img.width;

      canvas.width = MAX_WIDTH;
      canvas.height = img.height * scaleSize;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

      setForm((prev) => ({
        ...prev,
        image: compressedBase64,
      }));
    };
  };

  reader.readAsDataURL(file);
};

  async function loadPortfolio() {
    const snap = await getDocs(portfolioRef);
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  useEffect(() => {
    loadPortfolio();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.title || !form.category) {
      alert("Judul & kategori wajib diisi");
      return;
    }

    if (!form.image && !editId) {
      alert("Gambar wajib diisi");
      return;
    }

    try {
      if (editId) {
        await updateDoc(doc(db, "portfolio", editId), {
          title: form.title,
          category: form.category,
          image: form.image,
          createdAt: serverTimestamp(),
        });
        setEditId(null);
      } else {
        await addDoc(portfolioRef, form);
      }

      setForm({ title: "", category: "", image: "", createdAt: serverTimestamp() });
      loadPortfolio();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data");
    }
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, "portfolio", id));
    loadPortfolio();
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Portofolio</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white/10 p-5 rounded-xl border border-white/10 mb-6"
      >
        <label className="block mb-2">Kategori Produk</label>
        <select
          className="w-full px-3 py-2 rounded bg-[#1e293b]/40 mb-3"
          value={form.category}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, category: e.target.value }))
          }
          required
        >
          <option value="">Pilih kategori</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <label className="block mb-2">Judul</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, title: e.target.value }))
          }
          className="w-full px-3 py-2 rounded bg-white/20 mb-3"
          required
        />

        <label className="block mb-2">Gambar</label>
        <input type="file" accept="image/*" onChange={convertToBase64} />

        {form.image && (
          <img
            src={form.image}
            className="w-32 h-32 mt-3 mb-3 object-cover rounded"
            alt="preview"
          />
        )}

        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
        >
          {editId ? "Update Portofolio" : "Tambah Portofolio"}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white/10 p-4 rounded-xl border border-white/10"
          >
            <img
              src={item.image}
              className="w-full h-40 object-cover rounded mb-3"
              alt={item.title}
            />

            <h3 className="text-lg font-bold">{item.title}</h3>
            <p className="text-sm text-gray-300">{item.category}</p>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  setEditId(item.id);
                  setForm({
                    title: item.title,
                    category: item.category,
                    image: item.image,
                  });
                }}
                className="px-3 py-1 bg-yellow-500 rounded"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(item.id)}
                className="px-3 py-1 bg-red-500 rounded"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PortfolioCRUD;
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const categories = ["Logo", "Poster", "Feed Instagram", "Banner", "UI Design"];

function ProductCRUD() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    category: "",
    title: "",
    description: "",
    price: "",
  });
  const [editId, setEditId] = useState(null);

  const productsRef = collection(db, "products");

  async function loadProducts() {
    const snapshot = await getDocs(productsRef);
    setProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    if (editId) {
      await updateDoc(doc(db, "products", editId), form);
      setEditId(null);
    } else {
      await addDoc(productsRef, form);
    }

    setForm({ category: "", title: "", description: "", price: "" });
    loadProducts();
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, "products", id));
    loadProducts();
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Produk</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white/10 p-5 rounded-xl border border-white/10 mb-6"
      >
        {/* DROPDOWN CATEGORY */}
        <label className="block mb-2">Kategori Produk</label>
        <select
          className="w-full px-3 py-2 rounded bg-[#1e293b]/40 mb-3"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        >
          <option value="">Pilih kategori</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Title */}
        <label className="block mb-2">Nama Produk</label>
        <input
          type="text"
          className="w-full px-3 py-2 rounded bg-white/20 mb-3"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        {/* Description */}
        <label className="block mb-2">Deskripsi</label>
        <input
          type="text"
          className="w-full px-3 py-2 rounded bg-white/20 mb-3"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />

        {/* Price */}
        <label className="block mb-2">Harga</label>
        <input
          type="number"
          className="w-full px-3 py-2 rounded bg-white/20 mb-3"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />

        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
        >
          {editId ? "Update Produk" : "Tambah Produk"}
        </button>
      </form>

      {/* LIST PRODUK */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((item) => (
          <div
            key={item.id}
            className="bg-white/10 p-4 rounded-xl border border-white/10"
          >
            <h3 className="text-lg font-bold text-indigo-400">
              {item.category}
            </h3>
            <h4 className="text-md font-semibold">{item.title}</h4>
            <p className="text-gray-300 mb-2">{item.description}</p>
            <p className="text-gray-300 mb-2">Rp {item.price}</p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditId(item.id);
                  setForm({
                    category: item.category,
                    title: item.title,
                    description: item.description,
                    price: item.price,
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

export default ProductCRUD;
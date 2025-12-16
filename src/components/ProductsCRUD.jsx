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

function ProductCRUD() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
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

    setForm({ name: "", price: ""});
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
        <label className="block mb-2">Nama Produk</label>
        <input
          type="text"
          className="w-full px-3 py-2 rounded bg-white/20 mb-3"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((item) => (
          <div key={item.id} className="bg-white/10 p-4 rounded-xl border border-white/10">
            <h3 className="text-lg font-bold">{item.name}</h3>
            <p className="text-gray-300 mb-2">Rp {item.price}</p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditId(item.id);
                  setForm({
                    name: item.name,
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
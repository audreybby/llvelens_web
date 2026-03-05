// src/components/ProductDetail.jsx
import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import ProductGallery from "./ProductGallery";
import { useNavigate } from "react-router-dom";

export default function ProductDetail({ id }) {
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      // 🔹 1. Ambil product dulu
      const productRef = doc(db, "products", id);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) return;

      const productData = productSnap.data();
      setProduct(productData);

      // 🔹 2. Query portfolio berdasarkan category
      const q = query(
        collection(db, "portfolio"),
        where("category", "==", productData.category)
      );

      const querySnapshot = await getDocs(q);

      // ⚠️ sesuaikan field image (di CRUD kamu pakai "image")
      const imgs = querySnapshot.docs.map(doc => doc.data().image);
      setImages(imgs);
    };

    fetchData();
  }, [id]);

  if (!product) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 grid md:grid-cols-2 gap-8">
      
      {/* 🔥 Gallery */}
      {images.length > 0 && <ProductGallery images={images} />}

      {/* Info */}
      <div className="flex flex-col gap-4">
        <span className="text-sm text-indigo-500 font-semibold">
          {product.category}
        </span>

        <h1 className="text-3xl font-bold">{product.title}</h1>

        <p className="text-gray-600">{product.description}</p>

        <div className="text-2xl font-semibold text-indigo-600">
          Rp {product.price}
        </div>

        <button
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition"
          onClick={() => {
              navigate("/Pesanan");
          }}
        >
          Order Sekarang
        </button>
      </div>
    </div>
  );
}
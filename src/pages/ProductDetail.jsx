import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import ProductGallery from "../components/ProductGallery";
import { useNavigate } from "react-router-dom";

export default function ProductDetail({ id }) {
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {

      const productRef = doc(db, "products", id);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) return;

      const productData = productSnap.data();
      setProduct(productData);

      const q = query(
        collection(db, "portfolio"),
        where("category", "==", productData.category)
      );

      const querySnapshot = await getDocs(q);

      const imgs = querySnapshot.docs.map(doc => doc.data().image);
      setImages(imgs);
    };

    fetchData();
  }, [id]);

  if (!product)
    return (
      <p className="text-center mt-10 text-gray-500">
        Loading...
      </p>
    );

  return (
    <div className="bg-[#F7FAFF] min-h-screen py-4">

      <div className="max-w-5xl mx-auto p-6 grid md:grid-cols-2 gap-8">

        {images.length > 0 && <ProductGallery images={images} />}

        <div className="flex flex-col gap-4">

          <span className="text-sm text-[#6BA3D6] font-semibold">
            {product.category}
          </span>

          <h1 className="text-3xl font-bold text-[#1D3557]">
            {product.title}
          </h1>

          <p className="text-gray-600">
            {product.description}
          </p>

          <div className="text-2xl font-semibold text-[#1D3557]">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0
            }).format(product.price)}
          </div>

          <button
            className="
              bg-[#6BA3D6]
              text-white
              px-6
              py-3
              rounded-xl
              hover:bg-[#1D3557]
              transition
              shadow-sm
            "
            onClick={() => {
              navigate("/Pesanan", {
                state: {
                  productId: id,
                  title: product.title,
                  price: product.price,
                  category: product.category
                }
              });
            }}
          >
            Order Sekarang
          </button>

        </div>
      </div>

    </div>
  );
}
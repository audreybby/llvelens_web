// src/pages/Detail.jsx
import { useParams } from "react-router-dom";
import ProductDetail from "../components/ProductDetail";

export default function Detail() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductDetail id={id} />
    </div>
  );
}
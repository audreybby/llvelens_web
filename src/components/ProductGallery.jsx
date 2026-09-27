import { useState } from "react";

export default function ProductGallery({ images }) {
  const [selected, setSelected] = useState(images[0]);

  return (
    <div>
      <div className="mb-4">
        <img
          src={selected}
          className="w-full h-[350px] object-cover rounded-2xl shadow"
        />
      </div>

      <div className="flex gap-3 overflow-x-auto">
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            onClick={() => setSelected(img)}
            className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${
              selected === img ? "border-indigo-600" : "border-transparent"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
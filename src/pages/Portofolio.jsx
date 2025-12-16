import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";

export default function Portfolio() {
  const [portfolioData, setPortfolioData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [selected, setSelected] = useState("Logo");
  const [isOpen, setIsOpen] = useState(false);

  const options = ["Logo", "Poster", "Banner"];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, () => {});
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "portfolio"), (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPortfolioData(fetched);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const kategori = selected.toLowerCase();
    const filtered = portfolioData.filter(
      (item) => item.category?.toLowerCase() === kategori
    );

    setFilteredData(filtered);
  }, [selected, portfolioData]);

  return (
    <section className="w-full">
        <div className="bg-[#6BA3D6] py-12 text-center">
            <h2 className="text-3xl md:text-4xl font-aclonica text-white drop-shadow-md">
            Portofolio
            </h2>
        </div>

        <div className="bg-[#F7FAFF] w-full py-10">

            <div className="relative ml-14">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-[#649CCE] text-white font-semibold px-6 py-2 rounded-md shadow flex items-center justify-between gap-6 w-64"
            >
                {selected}
                <span className="text-white text-sm">⌄</span>
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-2 bg-white rounded-md shadow-lg w-40 z-10">
                {options.map((opt) => (
                    <button
                    key={opt}
                    onClick={() => {
                        setSelected(opt);
                        setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#649CCE]"
                    >
                    {opt}
                    </button>
                ))}
                </div>
            )}
            </div>

            <div className="py-16 flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto px-6 justify-start">
                {filteredData.length === 0 ? (
                <p className="text-gray-500 text-lg">Tidak ada data.</p>
                ) : (
                filteredData.map((item, index) => (
                    <motion.div
                    key={item.id}
                    className="overflow-hidden rounded-lg shadow-lg"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    viewport={{ once: true }}
                    >
                    <img
                        src={item.image}
                        alt="portfolio"
                        className="w-full h-[340px] object-cover object-left hover:scale-105 transition-transform duration-500"
                    />
                    </motion.div>
                ))
                )}
            </div>
            </div>
        </div> 
        </section>
  );
}

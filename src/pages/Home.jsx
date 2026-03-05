import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

import homeImg from "../assets/home.png";

export default function Home() {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch 4 portfolio terbaru
  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const q = query(
          collection(db, "portfolio"),
          orderBy("createdAt", "desc"),
          limit(4)
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPortfolios(data);
      } catch (error) {
        console.error("Gagal ambil portfolio:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  return (
    <div className="bg-[#649CCE] min-h-screen flex flex-col items-center">
      {/* ================= HERO ================= */}
      <div className="bg-[#649CCE] w-full flex flex-col md:flex-row items-center justify-center px-6 md:px-10 py-12 gap-8 mt-10">
        {/* TEXT */}
        <div className="flex-1 text-center md:text-left text-white font-aclonica md:ml-24">
          <h2 className="text-3xl sm:text-4xl md:text-5xl drop-shadow-md mt-1 leading-tight">
            <span className="block">Jasa Desain Digital</span>
            <span className="block">untuk Semua</span>
            <span className="block">Kebutuhanmu</span>
          </h2>

          <p className="text-base sm:text-lg md:text-2xl mt-4 leading-relaxed font-poppins">
            LLVELENS siap bantu kebutuhan desain kamu
          </p>

          <button
            className="bg-[#F7FAFF] text-[#031A40] px-10 py-3 rounded-lg text-lg md:text-xl font-AS hover:bg-[#D5E2EE] transition mt-6 md:mt-8 drop-shadow-lg"
            onClick={() => navigate("/product")}
          >
            Lihat Produk
          </button>
        </div>

        {/* IMAGE */}
        {/* <div className="flex-1 flex justify-center md:-mt-16 md:mr-20 h-[200px] sm:h-[240px] w-[220px] sm:w-[270px] rounded-xl">
          <img
            src={homeImg}
            alt="Jasa Desain"
            className="rounded-lg shadow-md w-full h-full object-cover"
          />
        </div> */}
      </div>

      {/* ================= KEUNGGULAN ================= */}
      <section className="relative w-full">
        <div className="bg-[#649CCE] text-center py-12">
          <h2 className="text-2xl md:text-3xl font-aclonica text-white">
            Kenapa harus pesan di sini?
          </h2>
        </div>

        {/* background bawah */}
        <div className="bg-[#f9fbfd] h-[100px] md:h-[265px] mt-12"></div>

        {/* CARD - tetap sejajar di mobile */}
        <div className="absolute top-[68%] md:top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-row justify-center items-center gap-4 sm:gap-6 md:gap-20 px-4">
          {["Trusted", "Murah", "Cepat"].map((item, i) => (
            <div
              key={i}
              className="
                w-[90px] h-[90px]
                sm:w-[120px] sm:h-[120px]
                md:w-[238px] md:h-[209px]
                bg-gray-200 rounded-xl shadow-md
                flex flex-col justify-center items-center
              "
            >
              <p className="text-sm sm:text-lg md:text-4xl font-aclonica text-biru drop-shadow-md text-center">
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= ABOUT DESIGNER ================= */}
      <section className="bg-[#f9fbfd] py-16 md:py-20 px-6 md:px-8 text-center">
        <h2 className="text-2xl md:text-4xl font-aclonica text-biru mb-6">
          Kenali Designer
        </h2>

        <p className="text-biru text-base sm:text-lg md:text-2xl leading-relaxed font-poppins mb-6">
          Halo! Saya adalah seorang desainer independen di balik{" "}
          <strong className="font-aclonica text-[#649CCE]">LLVELENS</strong> —
          studio kecil yang berfokus pada pembuatan desain untuk segala
          kebutuhanmu. Saya percaya setiap desain memiliki cerita, dan tugas
          saya adalah membantu kamu menceritakannya lewat warna dan bentuk.
        </p>

        <p className="text-biru text-base sm:text-lg md:text-2xl leading-relaxed font-poppins mb-10">
          Di website ini, kamu bisa menemukan berbagai karya yang dibuat dengan
          teliti, dari sketsa awal hingga hasil akhir yang siap digunakan. Jika
          kamu mencari desain yang hangat, manis, dan profesional — selamat
          datang di{" "}
          <strong className="font-aclonica text-[#649CCE]">LLVELENS</strong>!
          Mari mulai menciptakan sesuatu yang indah bersama!
        </p>
      </section>

      {/* ================= PORTFOLIO PREVIEW ================= */}
      <section className="bg-[#f9fbfd] w-full py-16">
        <h2 className="text-center text-3xl md:text-4xl font-aclonica text-[#1d3557] mb-12">
          Portofolio
        </h2>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto px-4 md:px-6">
          {loading ? (
            <p className="text-center col-span-2 text-gray-500">
              Loading portfolio...
            </p>
          ) : portfolios.length === 0 ? (
            <p className="text-center col-span-2 text-gray-500">
              Belum ada portfolio.
            </p>
          ) : (
            portfolios.map((item, index) => (
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
                  alt={item.title}
                  className="w-full h-[220px] md:h-[260px] object-cover hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
            ))
          )}
        </div>

        {/* BUTTON */}
        <div className="flex justify-center mt-12">
          <button
            className="bg-[#649CCE] text-white px-8 md:px-10 py-3 rounded-md text-base md:text-lg font-medium hover:bg-[#4f85aa] transition"
            onClick={() => navigate("/portfolio")}
          >
            Lihat Selengkapnya
          </button>
        </div>
      </section>
    </div>
  );
}
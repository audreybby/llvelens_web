import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import bg1 from "../assets/bg 1.jpg";
import bg4 from "../assets/bg 4.jpg";
import bg5 from "../assets/bg 5.jpg";
import bgZoom from "../assets/bg zoom.jpg";
import homeImg from "../assets/home.png";


export default function Home() {
  const portfolios = [
    { src: bg1, alt: "Portfolio 1" },
    { src: bg4, alt: "Portfolio 2" },
    { src: bg5, alt: "Portfolio 3" },
    { src: bgZoom, alt: "Portfolio 4" },
  ];

  const navigate = useNavigate();

  return (
    <div className="bg-[#649CCE] min-h-screen flex flex-col items-center">
      <div className="bg-[#649CCE] w-full flex flex-col md:flex-row items-center justify-center px-10 py-12 gap-4 mt-10">
        <div className="flex-1 text-left text-white font-aclonica ml-24">
          <h2 className="text-4xl md:text-5xl drop-shadow-md mt-1">
            <span className="block">Jasa Desain Digital</span>
            <span className="block">untuk Semua</span>
            <span className="block">Kebutuhanmu</span>
          </h2>
          <p className="text-base md:text-2xl mt-2 leading-relaxed font-poppins">
            LLVELENS siap bantu kebutuhan desain kamu
          </p>
          <button 
          className="bg-[#F7FAFF] text-[#031A40] px-12 py-2 rounded-lg text-xl font-AS hover:bg-[#D5E2EE] transition mt-8 drop-shadow-lg"
          onClick={() => navigate("/product")}
          >
            Lihat Produk
          </button>
        </div>

        <div className="flex-1 flex justify-center -mt-16 mr-20 h-[240px] rounded-xl w-[270px]">
          <img
            src={homeImg}
            alt="Jasa Desain"
            className="rounded-lg shadow-md"
          />
        </div>
      </div>

      <section className="relative w-full">
        <div className="bg-[#649CCE] text-center py-12">
          <h2 className="text-3xl font-aclonica text-white">
            Kenapa harus pesan di sini?
          </h2>
        </div>

        <div className="bg-[#f9fbfd] h-[265px] mt-12"></div>

        <div className="absolute top-[50%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-center gap-20">
          <div className="w-[238px] h-[209px] bg-gray-200 rounded-xl shadow-md flex flex-col justify-center items-center">
            <p className="text-4xl font-aclonica text-biru drop-shadow-md">Trusted</p>
          </div>

          <div className="w-[238px] h-[209px] bg-gray-200 rounded-xl shadow-md flex flex-col justify-center items-center">
            <p className="text-4xl font-aclonica text-biru drop-shadow-md">Murah</p>
          </div>

          <div className="w-[238px] h-[209px] bg-gray-200 rounded-xl shadow-md flex flex-col justify-center items-center">
            <p className="text-4xl font-aclonica text-biru drop-shadow-md">Cepat</p>
          </div>
        </div>
      </section>

      <section className="bg-[#f9fbfd] py-20 px-8 text-center">
        <div className="">
          <h2 className="text-3xl md:text-4xl font-aclonica text-biru mb-6">
            Kenali Designer
          </h2>

          <p className="text-biru text-xl md:text-2xl leading-relaxed font-poppins mb-6">
            Halo! Saya adalah seorang desainer independen di balik{" "}
            <strong className="font-aclonica text-[#649CCE]">LLVELENS</strong> — 
            studio kecil yang berfokus pada pembuatan desain untuk segala kebutuhanmu.
            Saya percaya setiap desain memiliki cerita, dan tugas saya adalah membantu kamu
            menceritakannya lewat warna dan bentuk.
          </p>

          <p className="text-biru text-xl md:text-2xl leading-relaxed font-poppins mb-10">
            Di website ini, kamu bisa menemukan berbagai karya yang dibuat dengan teliti,
            dari sketsa awal hingga hasil akhir yang siap digunakan. Jika kamu mencari
            desain yang hangat, manis, dan profesional — selamat datang di{" "}
            <strong className="font-aclonica text-[#649CCE]">LLVELENS</strong>!  
            Mari mulai menciptakan sesuatu yang indah bersama!
          </p>
        </div>
      </section>

      <section className="bg-[#f9fbfd] w-full py-16">
        <h2 className="text-center text-4xl font-aclonica text-[#1d3557] mb-12">
          Portofolio
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto px-6">
          {portfolios.map((item, index) => (
            <motion.div
              key={index}
              className="overflow-hidden rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <img
                src={item.src}
                alt={item.alt}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <button 
          className="bg-[#649CCE] text-white px-10 py-3 rounded-md text-lg font-medium hover:bg-[#4f85aa] transition"
          onClick={() => navigate("/Portfolio")}
          >
            Lihat Selengkapnya
          </button>
        </div>
      </section>
    </div>
  );
}
 
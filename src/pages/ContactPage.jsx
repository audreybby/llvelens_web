import { FaInstagram } from "react-icons/fa";

export default function Contact() {
  const instagramUsername = "llvelens";

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#F7FAFF] to-[#EAF2FF] flex items-center justify-center px-4">
      
      <div className="bg-white shadow-xl rounded-2xl p-8 sm:p-10 max-w-md w-full text-center">

        <div className="flex justify-center mb-6">
          <div className="bg-pink-100 p-4 rounded-full">
            <FaInstagram className="text-pink-500" size={30} />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-aclonica text-[#1D3557] mb-3">
          Hubungi Kami
        </h1>

        <p className="text-gray-500 mb-8 text-sm sm:text-base leading-relaxed">
          Punya pertanyaan atau ingin konsultasi desain?  
          Kunjungi Instagram kami untuk informasi lebih lanjut.
        </p>

        <a
          href={`https://instagram.com/${instagramUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex items-center justify-center gap-3
            bg-gradient-to-r from-pink-500 to-purple-500
            hover:opacity-90
            text-white
            py-3 rounded-xl
            shadow-md hover:shadow-lg
            transition-all duration-200
          "
        >
          <FaInstagram size={20} />
          {instagramUsername}
        </a>

      </div>
    </section>
  );
}
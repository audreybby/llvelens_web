import { FaWhatsapp, FaInstagram } from "react-icons/fa";

export default function Contact() {
  const whatsappNumber = "6281234567890"; // ganti nomor kamu
  const instagramUsername = "llvelens";   // ganti username kamu

  return (
    <section className="min-h-screen bg-[#F7FAFF] flex flex-col items-center justify-center px-4 sm:px-6">
      <div className="text-center max-w-xl w-full">
        {/* TITLE */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-aclonica text-[#1d3557] mb-4">
          Hubungi Kami
        </h1>

        {/* DESCRIPTION */}
        <p className="text-gray-600 mb-8 md:mb-10 text-base sm:text-lg leading-relaxed">
          Punya pertanyaan? <br className="sm:hidden" />
          Hubungi kami langsung melalui WhatsApp atau Instagram.
        </p>

        {/* BUTTON GROUP */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
          
          {/* WhatsApp */}
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex items-center justify-center gap-3
              w-full sm:w-auto
              bg-green-500 hover:bg-green-600
              text-white
              px-6 py-3
              rounded-xl
              shadow-lg
              transition
              text-base sm:text-lg
            "
          >
            <FaWhatsapp size={22} />
            Chat WhatsApp
          </a>

          {/* Instagram */}
          <a
            href={`https://instagram.com/${instagramUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex items-center justify-center gap-3
              w-full sm:w-auto
              bg-pink-500 hover:bg-pink-600
              text-white
              px-6 py-3
              rounded-xl
              shadow-lg
              transition
              text-base sm:text-lg
            "
          >
            <FaInstagram size={22} />
            Kunjungi Instagram
          </a>

        </div>
      </div>
    </section>
  );
}
import { motion } from "framer-motion";

export default function Portfolio() {
  const items = [1, 2, 3, 4]; // contoh data

  return (
    <section className="py-16 bg-[#f9fbfd]" id="portfolio">
      <h2 className="text-center text-3xl font-aclonica text-[#1d3557] mb-12">
        Portofolio
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto px-6">
        {items.map((item, index) => (
          <motion.div
            key={index}
            className="bg-gray-200 h-48 rounded-lg shadow-md"
            initial={{ opacity: 0, y: 50 }} // posisi awal
            whileInView={{ opacity: 1, y: 0 }} // pas discroll ke layar
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }} // muncul sekali aja
          >
            <div className="flex items-center justify-center h-full text-lg text-gray-600">
              Gambar {item}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

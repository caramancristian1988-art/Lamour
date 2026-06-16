const benefits = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Eficiență energetică",
    description: "Produse clasa A++ pentru consum minim",
    color: "bg-[#1d2353]",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      </svg>
    ),
    title: "Tehnologie modernă",
    description: "Inverter, WiFi, filtrare avansată",
    color: "bg-[#c7092b]",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Garanție și suport",
    description: "Garanție 3 ani, suport tehnic 24/7",
    color: "bg-[#1d2353]",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Instalare rapidă",
    description: "Instalare profesională în 24 ore",
    color: "bg-[#c7092b]",
  },
];

export default function Benefits() {
  return (
    <section className="bg-white py-10 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[#f6f8fb] transition-colors"
            >
              <div
                className={`${benefit.color} w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0`}
              >
                {benefit.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827]">{benefit.title}</h3>
                <p className="text-xs text-[#6b7280] mt-0.5">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

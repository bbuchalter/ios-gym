export function Header() {
  return (
    <header className="relative bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 py-20 px-6 text-center text-white shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight drop-shadow-lg">
          Network Engineering Course
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 font-light">
          From CLI basics to advanced routing • Learn by doing • Interactive terminals
        </p>
      </div>
    </header>
  );
}


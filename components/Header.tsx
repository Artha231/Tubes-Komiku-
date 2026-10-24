'use client';

export default function Header() {
  return (
    <header className="bg-gray-800 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-red-500">Komiku App</h1>
        <nav className="flex gap-4 text-sm">
          <a href="/" className="hover:text-red-400">Home</a>
          <a href="#" className="hover:text-red-400">Populer</a>
          <a href="#" className="hover:text-red-400">Terbaru</a>
        </nav>
      </div>
    </header>
  );
}

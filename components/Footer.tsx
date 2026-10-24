'use client';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-400 text-center p-4 mt-8 text-sm">
      <p>&copy; {new Date().getFullYear()} Komiku App. All rights reserved.</p>
    </footer>
  );
}

import Link from "next/link";

export function Header() {
  return (
    <header className="px-6 py-12 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          Command the network CLI with confidence.
        </h1>
        <p className="text-lg mb-6 text-gray-300">
          This is a scrollable operations notebook built for students and
          CyberPatriot teams. Every concept flows into an embedded IOS
          terminal so you can read, type, and verify without switching tabs.
        </p>
        <div className="flex gap-4">
          <Link
            href="#lessons"
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Begin the mission
          </Link>
          <a
            href="#curriculum"
            className="px-6 py-3 border border-gray-600 text-white rounded hover:bg-gray-800"
          >
            See curriculum map
          </a>
        </div>
      </div>
    </header>
  );
}

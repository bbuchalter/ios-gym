export function Footer() {
  const navigation = [
    { label: "Overview", href: "#top" },
    { label: "Curriculum", href: "#curriculum" },
    { label: "Lessons", href: "#lessons" },
  ];

  return (
    <footer className="mt-24 border-t border-gray-700 px-6 py-12 bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="text-sm font-semibold mb-4 text-gray-400">
              IOS Practice Lab
            </p>
            <p className="text-gray-300">
              A teaching surface for mentors, teams, and self-starters who want
              their first network role to feel familiar on day one.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold mb-4 text-gray-400">
              Navigate
            </p>
            <ul className="space-y-2 text-gray-300">
              {navigation.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="hover:text-white">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold mb-4 text-gray-400">
              Contact
            </p>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>Coach-ready briefings</li>
              <li>Weekly cohort updates</li>
              <li>feedback@practice-lab.dev</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-700 text-sm text-gray-500">
          © {new Date().getFullYear()} IOS Practice Lab
        </div>
      </div>
    </footer>
  );
}


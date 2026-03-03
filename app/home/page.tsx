export default function HomePage() {
  const links = [
    ['Capture Training', '/capture'],
    ['Dashboard', '/dashboard'],
    ['Reports', '/reports'],
    ['Admin', '/admin']
  ];
  return <section className="card grid">
    <h2>Home</h2>
    <div className="nav-grid">
      {links.map(([label, href]) => <a key={href} className="card" href={href}>{label}</a>)}
    </div>
  </section>;
}

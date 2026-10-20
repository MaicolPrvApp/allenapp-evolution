import { useEffect } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useStore, type Role } from "../data/store";
import { Icon, Logo } from "./Icon";
import { fullName } from "../lib/util";

const TRAINER_NAV = [
  ["/t", "Panoramica", "home"],
  ["/t/clienti", "Clienti", "users"],
  ["/t/schede", "Schede", "clipboard"],
  ["/t/esercizi", "Esercizi", "dumbbell"],
  ["/t/impostazioni", "Impostazioni", "settings"],
] as const;
const CLIENT_NAV = [
  ["/c", "Allenamento", "play"],
  ["/c/diario", "Diario", "book"],
  ["/c/progressi", "Progressi", "chart"],
] as const;

export function Layout() {
  const { role, setRole, meId, setMe, clients } = useStore();
  const nav = useNavigate();
  const loc = useLocation();
  const isClientPath = loc.pathname.startsWith("/c");

  useEffect(() => scrollTo(0, 0), [loc.pathname]);

  // l'URL comanda: aprire un link dell'area cliente attiva il ruolo cliente
  useEffect(() => {
    const r: Role = isClientPath ? "client" : "trainer";
    if (r !== role) setRole(r);
  }, [isClientPath, role, setRole]);

  useEffect(() => {
    if (!meId || !clients.some((c) => c.id === meId)) setMe(clients[0]?.id ?? null);
  }, [meId, clients, setMe]);

  const switchRole = (r: Role) => {
    setRole(r);
    nav(r === "client" ? "/c" : "/t");
  };
  const items = isClientPath ? CLIENT_NAV : TRAINER_NAV;

  const roleSwitch = (
    <div className="seg" role="group" aria-label="Area">
      <button aria-pressed={!isClientPath} onClick={() => switchRole("trainer")}>Trainer</button>
      <button aria-pressed={isClientPath} onClick={() => switchRole("client")}>Cliente</button>
    </div>
  );
  const clientPicker = isClientPath && (
    <label className="field">
      <span>Stai vedendo l'app di</span>
      <select value={meId ?? ""} onChange={(e) => setMe(e.target.value)}>
        {clients.map((c) => <option key={c.id} value={c.id}>{fullName(c)}</option>)}
      </select>
    </label>
  );

  return (
    <div className="app">
      <aside className="side">
        <Link to="/" className="brand"><Logo /><span><b>Kinetika</b><small>{isClientPath ? "Area cliente" : "Area trainer"}</small></span></Link>
        <div style={{ padding: "0 6px" }}>{roleSwitch}</div>
        <nav className="nav">
          {items.map(([to, label, icon]) => (
            <NavLink key={to} to={to} end={to === "/t" || to === "/c"}><Icon name={icon} />{label}</NavLink>
          ))}
        </nav>
        <div className="spacer" />
        <div style={{ padding: "0 6px" }}>{clientPicker}</div>
      </aside>
      <div className="main">
        <header className="topbar">
          <Link to="/" className="brand"><Logo size={30} /><b>Kinetika</b></Link>
          {roleSwitch}
        </header>
        <div className="content">
          {isClientPath && <div className="topbar-picker" style={{ marginBottom: 14 }}><MobileOnly>{clientPicker}</MobileOnly></div>}
          <Outlet />
        </div>
        <nav className="bottomnav">
          {items.map(([to, label, icon]) => (
            <NavLink key={to} to={to} end={to === "/t" || to === "/c"}><Icon name={icon} size={22} />{label}</NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

function MobileOnly({ children }: { children: React.ReactNode }) {
  return <div className="mobile-only">{children}</div>;
}

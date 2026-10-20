import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useStore, type Role } from "../data/store";
import { Icon, Logo } from "./Icon";
import { fullName } from "../lib/util";

const TRAINER_NAV = [
  ["/t", "Panoramica", "home"],
  ["/t/clienti", "Clienti", "users"],
  ["/t/agenda", "Agenda", "calendar"],
  ["/t/schede", "Schede", "clipboard"],
  ["/t/generatore", "Generatore", "sparkle"],
  ["/t/esercizi", "Esercizi", "dumbbell"],
  ["/t/alimentazione", "Alimentazione", "food"],
  ["/t/messaggi", "Messaggi", "chat"],
  ["/t/impostazioni", "Impostazioni", "settings"],
] as const;
/** voci visibili nella barra in basso del telefono; le altre finiscono in «Altro» */
const MOBILE_SLOTS = 4;

const CLIENT_NAV = [
  ["/c", "Allenamento", "play"],
  ["/c/agenda", "Agenda", "calendar"],
  ["/c/alimentazione", "Alimentazione", "food"],
  ["/c/progressi", "Progressi", "chart"],
  ["/c/diario", "Diario", "book"],
  ["/c/messaggi", "Messaggi", "chat"],
] as const;

export function Layout() {
  const { role, setRole, meId, setMe, clients, messages } = useStore();
  const nav = useNavigate();
  const loc = useLocation();
  const isClientPath = loc.pathname.startsWith("/c");
  const [more, setMore] = useState(false);

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
  // messaggi non letti: per il trainer quelli dei clienti, per il cliente quelli del trainer
  const unread = isClientPath
    ? messages.filter((m) => m.clientId === meId && m.from === "trainer" && !m.read).length
    : messages.filter((m) => m.from === "client" && !m.read).length;
  const badge = (to: string) => (to.endsWith("/messaggi") && unread > 0 ? <span className="badge" style={{ marginLeft: "auto" }}>{unread}</span> : null);

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
            <NavLink key={to} to={to} end={to === "/t" || to === "/c"}><Icon name={icon} />{label}{badge(to)}</NavLink>
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
          {items.slice(0, items.length > MOBILE_SLOTS + 1 ? MOBILE_SLOTS : items.length).map(([to, label, icon]) => (
            <NavLink key={to} to={to} end={to === "/t" || to === "/c"}><span style={{ position: "relative" }}><Icon name={icon} size={22} />{to.endsWith("/messaggi") && unread > 0 && <i className="nav-dot" />}</span>{label}</NavLink>
          ))}
          {items.length > MOBILE_SLOTS + 1 && (
            <button className={items.slice(MOBILE_SLOTS).some(([to]) => loc.pathname.startsWith(to)) ? "active" : ""} onClick={() => setMore(true)}>
              <span style={{ position: "relative" }}><Icon name="menu" size={22} />{unread > 0 && items.slice(MOBILE_SLOTS).some(([to]) => to.endsWith("/messaggi")) && <i className="nav-dot" />}</span>Altro
            </button>
          )}
        </nav>
      </div>
      {more && (
        <div className="modal-bg" style={{ alignItems: "end", padding: 0 }} onClick={() => setMore(false)}>
          <nav className="sheet" onClick={(e) => e.stopPropagation()}>
            {items.slice(MOBILE_SLOTS).map(([to, label, icon]) => (
              <NavLink key={to} to={to} onClick={() => setMore(false)}><Icon name={icon} />{label}{badge(to)}</NavLink>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}

function MobileOnly({ children }: { children: React.ReactNode }) {
  return <div className="mobile-only">{children}</div>;
}

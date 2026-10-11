import Link from "next/link";
import { getAdminStatus } from "@/lib/auth";
import NavbarShell from "@/components/NavbarShell";

export default async function Header() {
  const { user, isAdmin } = await getAdminStatus();
  return (
    <NavbarShell>
      <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
        <li className="nav-item">
          <Link className="nav-link" href="/about">
            About
          </Link>
        </li>
        {isAdmin && (
          <li className="nav-item">
            <Link className="nav-link" href="/god">
              God
            </Link>
          </li>
        )}
        {user ? (
          <>
            <li className="nav-item">
              <span className="navbar-text">
                {user.nickname || user.name || user.email}
              </span>
            </li>
            <li className="nav-item">
              {/* Must be a plain <a>: /auth/* routes are handled by the proxy, not the router. */}
              <a className="nav-link" href="/auth/logout">
                Logout
              </a>
            </li>
          </>
        ) : (
          <li className="nav-item">
            <a className="nav-link" href="/auth/login?returnTo=/god">
              God
            </a>
          </li>
        )}
      </ul>
    </NavbarShell>
  );
}

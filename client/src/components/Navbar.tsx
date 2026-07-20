import { NavLink, useNavigate } from "react-router-dom";
import { useGroceryList } from "../context/GroceryListContext";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

function Navbar({ searchTerm, onSearchChange }: NavbarProps) {
  const { itemCount } = useGroceryList();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <span className="navbar__brand-icon">🛒</span>
        Price<span>Compare</span>
      </div>
      <div className="navbar__links">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `navbar__link ${isActive ? "navbar__link--active" : ""}`
          }
        >
          Home
        </NavLink>
        {user && (
          <>
            <NavLink
              to="/list"
              className={({ isActive }) =>
                `navbar__link ${isActive ? "navbar__link--active" : ""}`
              }
            >
              My List
              {itemCount > 0 && <span className="navbar__badge">{itemCount}</span>}
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `navbar__link ${isActive ? "navbar__link--active" : ""}`
              }
            >
              Profile
            </NavLink>
          </>
        )}
      </div>
      <div className="navbar__search-wrapper">
        <svg
          className="navbar__search-icon"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="navbar__search"
        />
      </div>
      <div className="navbar__auth">
        {user ? (
          <>
            <span className="navbar__avatar">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <button onClick={handleLogout} className="btn btn--ghost btn--sm">
              Logout
            </button>
          </>
        ) : (
          <NavLink to="/login" className="btn btn--primary btn--sm">
            Sign In
          </NavLink>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

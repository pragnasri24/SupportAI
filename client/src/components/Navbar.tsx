import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import "../styles/navbar.css";

type StoredUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("supportai_token");
    const storedUser = localStorage.getItem("supportai_user");

    setIsLoggedIn(Boolean(token));

    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser) as StoredUser);
      } catch {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("supportai_token");
    localStorage.removeItem("supportai_user");

    setIsLoggedIn(false);
    setCurrentUser(null);

    navigate("/login", {
      replace: true,
    });
  };

  const isAgent =
    currentUser?.role === "AGENT" || currentUser?.role === "ADMIN";

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">SupportAI</Link>
      </div>

      <div className="links">
        <Link to="/">Home</Link>

        {isLoggedIn ? (
          <>
            {isAgent ? (
              <Link to="/agent/dashboard">Agent Dashboard</Link>
            ) : (
              <Link to="/dashboard">Dashboard</Link>
            )}

            <button
              className="btn logout-btn"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>

            <Link className="btn" to="/register">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
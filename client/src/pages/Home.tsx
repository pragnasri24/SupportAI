import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

type StoredUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

function Home() {
  const navigate = useNavigate();

  const [message, setMessage] = useState(
    "Checking backend connection..."
  );

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(
          `${API_URL}/health`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            "Backend connection failed"
          );
        }

        setMessage(
          data.message ||
            "Backend is connected"
        );

        setConnected(true);
      } catch (error) {
        console.error(
          "Backend health check failed:",
          error
        );

        setMessage(
          "Backend is not connected"
        );

        setConnected(false);
      }
    };

    void checkBackend();
  }, []);

  const handleGetStarted = () => {
    const token =
      localStorage.getItem(
        "supportai_token"
      );

    const storedUser =
      localStorage.getItem(
        "supportai_user"
      );

    if (!token || !storedUser) {
      navigate("/register");
      return;
    }

    try {
      const user =
        JSON.parse(
          storedUser
        ) as StoredUser;

      if (
        user.role === "AGENT" ||
        user.role === "ADMIN"
      ) {
        navigate(
          "/agent-dashboard"
        );
      } else {
        navigate("/dashboard");
      }
    } catch {
      localStorage.removeItem(
        "supportai_token"
      );

      localStorage.removeItem(
        "supportai_user"
      );

      navigate("/register");
    }
  };

  return (
    <div className="home">
      <div className="hero">
        <h1>
          AI Customer Support Platform
        </h1>

        <p>
          Manage customer support tickets,
          conversations, assignments,
          analytics, and support workflows
          from one platform.
        </p>

        <button
          type="button"
          onClick={handleGetStarted}
        >
          Get Started
        </button>
      </div>

      <div className="statusCard">
        <h2>Backend Status</h2>

        <p
          className={
            connected ? "green" : "red"
          }
        >
          {message}
        </p>
      </div>
    </div>
  );
}

export default Home;
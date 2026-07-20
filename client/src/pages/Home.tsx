import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("Checking backend connection...");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/health");
        const data = await response.json();

        if (!response.ok) {
          throw new Error("Backend connection failed");
        }

        setMessage(data.message || "Backend is connected");
        setConnected(true);
      } catch (error) {
        console.error("Backend health check failed:", error);
        setMessage("Backend is not connected");
        setConnected(false);
      }
    };

    void checkBackend();
  }, []);

  const handleGetStarted = () => {
    const token = localStorage.getItem("supportai_token");

    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="home">
      <div className="hero">
        <h1>AI Customer Support Platform</h1>

        <p>
          Automate customer support using AI, ticket management, analytics,
          and intelligent knowledge search.
        </p>

        <button type="button" onClick={handleGetStarted}>
          Get Started
        </button>
      </div>

      <div className="statusCard">
        <h2>Backend Status</h2>

        <p className={connected ? "green" : "red"}>{message}</p>
      </div>
    </div>
  );
}

export default Home;
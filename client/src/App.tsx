import {
  lazy,
  Suspense,
} from "react";

import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

const Home = lazy(
  () => import("./pages/Home")
);

const Login = lazy(
  () => import("./pages/Login")
);

const Register = lazy(
  () => import("./pages/Register")
);

const Dashboard = lazy(
  () => import("./pages/Dashboard")
);

const TicketDetails = lazy(
  () => import("./pages/TicketDetails")
);

const AgentDashboard = lazy(
  () => import("./pages/AgentDashboard")
);

function App() {
  return (
    <>
      <Navbar />

      <Suspense
        fallback={
          <div
            style={{
              padding: "40px",
              textAlign: "center",
            }}
          >
            Loading SupportAI...
          </div>
        }
      >
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                allowedRoles={["CUSTOMER"]}
              >
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tickets/:ticketId"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "CUSTOMER",
                  "AGENT",
                  "ADMIN",
                ]}
              >
                <TicketDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/agent-dashboard"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "AGENT",
                  "ADMIN",
                ]}
              >
                <AgentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
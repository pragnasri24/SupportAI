import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import socket from "../socket";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import "../styles/agent-dashboard.css";

type TicketStatus = "OPEN" | "PENDING" | "CLOSED";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH";

type TicketUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AssignedAgent = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Ticket = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;

  userId: string;

  assignedAgentId?: string | null;
  assignedAgent?: AssignedAgent | null;

  createdAt: string;
  updatedAt: string;

  user: TicketUser;

  _count?: {
    comments: number;
  };
};

type TicketsResponse = {
  success: boolean;
  message?: string;
  tickets?: Ticket[];
};

type AssignmentResponse = {
  success: boolean;
  message?: string;
  ticket?: Ticket;
};

type StoredUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AssignmentFilter = "ALL" | "MY_TICKETS" | "UNASSIGNED";
type StatusFilter = "ALL" | TicketStatus;
type PriorityFilter = "ALL" | TicketPriority;
type SortOrder = "NEWEST" | "OLDEST" | "PRIORITY";

const API_URL = "http://localhost:5000/api";

function AgentDashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [assigningTicketId, setAssigningTicketId] = useState<string | null>(
    null
  );

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");
  const [priorityFilter, setPriorityFilter] =
    useState<PriorityFilter>("ALL");
  const [assignmentFilter, setAssignmentFilter] =
    useState<AssignmentFilter>("ALL");
  const [sortOrder, setSortOrder] =
    useState<SortOrder>("NEWEST");

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("supportai_token");

      const response = await fetch(`${API_URL}/tickets`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });

      const data = (await response.json()) as TicketsResponse;

      if (!response.ok || !data.success || !data.tickets) {
        throw new Error(data.message || "Unable to load tickets.");
      }

      setTickets(data.tickets);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load tickets."
      );
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  const storedUser = localStorage.getItem("supportai_user");
  const token = localStorage.getItem("supportai_token");

  if (!storedUser || !token) {
    navigate("/login", {
      replace: true,
    });

    return;
  }

  try {
    const parsedUser = JSON.parse(storedUser) as StoredUser;

    if (parsedUser.role !== "AGENT") {
      navigate("/dashboard", {
        replace: true,
      });

      return;
    }

    setCurrentUser(parsedUser);
  } catch {
    localStorage.removeItem("supportai_user");
    localStorage.removeItem("supportai_token");

    navigate("/login", {
      replace: true,
    });

    return;
  }

  void fetchTickets();

  // Socket.IO listener
  socket.on("ticketCreated", () => {
    console.log("📩 New ticket received");
    void fetchTickets();
  });

  socket.on("ticketUpdated", () => {
    console.log("🔄 Ticket updated");
    void fetchTickets();
  });

  socket.on("ticketAssigned", () => {
    console.log("👨‍💻 Ticket assigned");
    void fetchTickets();
  });

  socket.on("ticketClosed", () => {
    console.log("✅ Ticket closed");
    void fetchTickets();
  });

  return () => {
    socket.off("ticketCreated");
    socket.off("ticketUpdated");
    socket.off("ticketAssigned");
    socket.off("ticketClosed");
  };
}, [navigate]);

    
 

  const assignTicket = async (ticketId: string) => {
    if (!currentUser) {
      setError("Agent information is unavailable.");
      return;
    }

    try {
      setAssigningTicketId(ticketId);
      setError("");
      setSuccessMessage("");

      const token = localStorage.getItem("supportai_token");

      const response = await fetch(
        `${API_URL}/tickets/${ticketId}/assign`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            agentId: currentUser.id,
          }),
        }
      );

      const data = (await response.json()) as AssignmentResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to assign the ticket."
        );
      }

      setSuccessMessage("Ticket assigned successfully.");

      await fetchTickets();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to assign the ticket."
      );
    } finally {
      setAssigningTicketId(null);
    }
  };

  const unassignTicket = async (ticketId: string) => {
    try {
      setAssigningTicketId(ticketId);
      setError("");
      setSuccessMessage("");

      const token = localStorage.getItem("supportai_token");

      const response = await fetch(
        `${API_URL}/tickets/${ticketId}/unassign`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      const data = (await response.json()) as AssignmentResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to unassign the ticket."
        );
      }

      setSuccessMessage("Ticket unassigned successfully.");

      await fetchTickets();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to unassign the ticket."
      );
    } finally {
      setAssigningTicketId(null);
    }
  };

  const filteredTickets = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    const result = tickets.filter((ticket) => {
      const assignedAgentName =
        ticket.assignedAgent?.name?.toLowerCase() || "";

      const assignedAgentEmail =
        ticket.assignedAgent?.email?.toLowerCase() || "";

      const matchesSearch =
        !normalizedSearch ||
        ticket.title.toLowerCase().includes(normalizedSearch) ||
        ticket.description.toLowerCase().includes(normalizedSearch) ||
        ticket.user.name.toLowerCase().includes(normalizedSearch) ||
        ticket.user.email.toLowerCase().includes(normalizedSearch) ||
        assignedAgentName.includes(normalizedSearch) ||
        assignedAgentEmail.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" ||
        ticket.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ||
        ticket.priority === priorityFilter;

      const matchesAssignment =
        assignmentFilter === "ALL" ||
        (assignmentFilter === "MY_TICKETS" &&
          ticket.assignedAgentId === currentUser?.id) ||
        (assignmentFilter === "UNASSIGNED" &&
          !ticket.assignedAgentId);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesAssignment
      );
    });

    return [...result].sort((firstTicket, secondTicket) => {
      if (sortOrder === "OLDEST") {
        return (
          new Date(firstTicket.createdAt).getTime() -
          new Date(secondTicket.createdAt).getTime()
        );
      }

      if (sortOrder === "PRIORITY") {
        const priorityOrder: Record<TicketPriority, number> = {
          HIGH: 3,
          MEDIUM: 2,
          LOW: 1,
        };

        return (
          priorityOrder[secondTicket.priority] -
          priorityOrder[firstTicket.priority]
        );
      }

      return (
        new Date(secondTicket.createdAt).getTime() -
        new Date(firstTicket.createdAt).getTime()
      );
    });
  }, [
    tickets,
    searchText,
    statusFilter,
    priorityFilter,
    assignmentFilter,
    sortOrder,
    currentUser,
  ]);

  const totalTickets = tickets.length;

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "OPEN"
  ).length;

  const pendingTickets = tickets.filter(
    (ticket) => ticket.status === "PENDING"
  ).length;

  const closedTickets = tickets.filter(
    (ticket) => ticket.status === "CLOSED"
  ).length;

  const myTickets = tickets.filter(
    (ticket) => ticket.assignedAgentId === currentUser?.id
  ).length;
const statusChartData = [
  { name: "Open", value: openTickets },
  { name: "Pending", value: pendingTickets },
  { name: "Closed", value: closedTickets },
];

const priorityChartData = [
  {
    name: "High",
    value: tickets.filter((t) => t.priority === "HIGH").length,
  },
  {
    name: "Medium",
    value: tickets.filter((t) => t.priority === "MEDIUM").length,
  },
  {
    name: "Low",
    value: tickets.filter((t) => t.priority === "LOW").length,
  },
];

const ticketsPerDay = useMemo(() => {
  const grouped: Record<string, number> = {};

  tickets.forEach((ticket) => {
    const day = new Date(ticket.createdAt).toLocaleDateString();

    grouped[day] = (grouped[day] || 0) + 1;
  });

  return Object.entries(grouped).map(([date, tickets]) => ({
    date,
    tickets,
  }));
}, [tickets]);
  const handleLogout = () => {
    localStorage.removeItem("supportai_token");
    localStorage.removeItem("supportai_user");

    navigate("/login", {
      replace: true,
    });
  };

  if (loading) {
    return (
      <main className="agent-dashboard-page">
        <div className="agent-dashboard-container">
          <div className="agent-dashboard-state">
            Loading agent dashboard...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="agent-dashboard-page">
      <div className="agent-dashboard-container">
        <header className="agent-dashboard-header">
          <div>
            <p className="agent-dashboard-eyebrow">
              Support operations
            </p>

            <h1>Agent Dashboard</h1>

            <p>
              Welcome back,{" "}
              {currentUser?.name || "Support Agent"}. Review and
              manage all customer support requests.
            </p>
          </div>

          <button
            className="agent-dashboard-logout"
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </header>

        {error && (
          <div className="agent-dashboard-error">
            {error}
          </div>
        )}

        {successMessage && (
          <div
            className="agent-dashboard-success"
            role="status"
          >
            {successMessage}
          </div>
        )}

        <section className="agent-dashboard-summary">
          <article className="agent-summary-card">
            <span>Total Tickets</span>
            <strong>{totalTickets}</strong>
          </article>

          <article className="agent-summary-card agent-summary-open">
            <span>Open</span>
            <strong>{openTickets}</strong>
          </article>

          <article className="agent-summary-card agent-summary-pending">
            <span>Pending</span>
            <strong>{pendingTickets}</strong>
          </article>

          <article className="agent-summary-card agent-summary-closed">
            <span>Closed</span>
            <strong>{closedTickets}</strong>
          </article>

          <article className="agent-summary-card">
            <span>My Tickets</span>
            <strong>{myTickets}</strong>
          </article>
        </section>
        {/* ==================== Analytics Section ==================== */}

<section className="agent-dashboard-analytics">

  <div className="agent-chart-card">
    <h3>Tickets by Status</h3>

    <div className="agent-chart">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={statusChartData}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label
          >
          {statusChartData.map((_, index) => (
              <Cell
                key={index}
                fill={
                  [
                    "#3B82F6",
                    "#F59E0B",
                    "#22C55E",
                  ][index]
                }
              />
            ))}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>

  <div className="agent-chart-card">
    <h3>Tickets by Priority</h3>

    <div className="agent-chart">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={priorityChartData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="name" />

          <YAxis />

          <Tooltip />

          <Bar dataKey="value">
         {priorityChartData.map((_, index) => (
              <Cell
                key={index}
                fill={
                  [
                    "#EF4444",
                    "#F59E0B",
                    "#22C55E",
                  ][index]
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>

  <div className="agent-chart-card">
    <h3>Tickets Created</h3>

    <div className="agent-chart">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={ticketsPerDay}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="date" />

          <YAxis />

          <Tooltip />

          <Legend />

          <Line
            type="monotone"
            dataKey="tickets"
            stroke="#3B82F6"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>

  <div className="agent-chart-card">
    <h3>Recent Activity</h3>

    <div className="agent-recent-activity">
      {tickets
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
        .slice(0, 5)
        .map((ticket) => (
          <div
            key={ticket.id}
            className="agent-activity-item"
          >
            <div>
              <div className="agent-activity-title">
                {ticket.title}
              </div>

              <div className="agent-activity-date">
                {new Date(
                  ticket.createdAt
                ).toLocaleString()}
              </div>
            </div>

            <span
              className={`status-badge status-${ticket.status.toLowerCase()}`}
            >
              {ticket.status}
            </span>
          </div>
        ))}
    </div>
  </div>

</section>

        <section className="agent-dashboard-panel">
          <div className="agent-dashboard-panel-header">
            <div>
              <h2>Support Tickets</h2>

              <p>
                Showing {filteredTickets.length} of{" "}
                {tickets.length} tickets
              </p>
            </div>

            <button
              className="agent-dashboard-refresh"
              type="button"
              onClick={() => void fetchTickets()}
            >
              Refresh
            </button>
          </div>

          <div className="agent-dashboard-filters">
            <input
              type="search"
              placeholder="Search tickets, customers, agents, or emails..."
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as StatusFilter
                )
              }
            >
              <option value="ALL">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="PENDING">Pending</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event.target.value as PriorityFilter
                )
              }
            >
              <option value="ALL">All priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={assignmentFilter}
              onChange={(event) =>
                setAssignmentFilter(
                  event.target.value as AssignmentFilter
                )
              }
            >
              <option value="ALL">All assignments</option>
              <option value="MY_TICKETS">
                My tickets
              </option>
              <option value="UNASSIGNED">
                Unassigned tickets
              </option>
            </select>

            <select
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(
                  event.target.value as SortOrder
                )
              }
            >
              <option value="NEWEST">
                Newest first
              </option>
              <option value="OLDEST">
                Oldest first
              </option>
              <option value="PRIORITY">
                Highest priority
              </option>
            </select>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="agent-dashboard-empty">
              <h3>No tickets found</h3>
              <p>
                Try changing your filters or search text.
              </p>
            </div>
          ) : (
            <div className="agent-ticket-list">
              {filteredTickets.map((ticket) => {
                const isAssignedToCurrentAgent =
                  ticket.assignedAgentId === currentUser?.id;

                const isAssignedToAnotherAgent =
                  Boolean(ticket.assignedAgentId) &&
                  !isAssignedToCurrentAgent;

                const isUpdating =
                  assigningTicketId === ticket.id;

                return (
                  <article
                    className="agent-ticket-card"
                    key={ticket.id}
                  >
                    <div className="agent-ticket-main">
                      <div className="agent-ticket-title-row">
                        <div>
                          <p className="agent-ticket-customer">
                            {ticket.user.name} ·{" "}
                            {ticket.user.email}
                          </p>

                          <h3>{ticket.title}</h3>
                        </div>

                        <div className="agent-ticket-badges">
                          <span
                            className={`agent-ticket-status agent-ticket-status-${ticket.status.toLowerCase()}`}
                          >
                            {ticket.status}
                          </span>

                          <span
                            className={`agent-ticket-priority agent-ticket-priority-${ticket.priority.toLowerCase()}`}
                          >
                            {ticket.priority}
                          </span>

                          {isAssignedToCurrentAgent && (
                            <span className="agent-ticket-assigned-badge">
                              Assigned to You
                            </span>
                          )}

                          {isAssignedToAnotherAgent && (
                            <span className="agent-ticket-assigned-badge">
                              Assigned
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="agent-ticket-description">
                        {ticket.description}
                      </p>

                      <div className="agent-ticket-meta">
                        <span>
                          Created{" "}
                          {new Date(
                            ticket.createdAt
                          ).toLocaleString()}
                        </span>

                        <span>
                          {ticket._count?.comments || 0}{" "}
                          replies
                        </span>

                        <span>
                          Customer role: {ticket.user.role}
                        </span>

                        <span>
                          Assigned to:{" "}
                          {ticket.assignedAgent
                            ? ticket.assignedAgent.name
                            : "Unassigned"}
                        </span>
                      </div>
                    </div>

                    <div className="agent-ticket-actions">
                      <Link
                        className="agent-ticket-open-button"
                        to={`/tickets/${ticket.id}`}
                      >
                        Open Ticket
                      </Link>

                      {!ticket.assignedAgentId && (
                        <button
                          className="agent-ticket-open-button"
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            void assignTicket(ticket.id)
                          }
                        >
                          {isUpdating
                            ? "Assigning..."
                            : "Assign to Me"}
                        </button>
                      )}

                      {isAssignedToCurrentAgent && (
                        <button
                          className="agent-ticket-unassign-button"
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            void unassignTicket(ticket.id)
                          }
                        >
                          {isUpdating
                            ? "Updating..."
                            : "Unassign"}
                        </button>
                      )}

                      {isAssignedToAnotherAgent && (
                        <button
                          className="agent-ticket-open-button"
                          type="button"
                          disabled
                        >
                          Assigned to{" "}
                          {ticket.assignedAgent?.name ||
                            "Another Agent"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default AgentDashboard;
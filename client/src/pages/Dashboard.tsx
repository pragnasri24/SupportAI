import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../styles/dashboard.css";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type TicketStatus = "OPEN" | "PENDING" | "CLOSED";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH";

type Ticket = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

type TicketsResponse = {
  success: boolean;
  message?: string;
  tickets?: Ticket[];
};

type CreateTicketResponse = {
  success: boolean;
  message?: string;
  ticket?: Ticket;
};

type StatusFilter = "ALL" | TicketStatus;
type PriorityFilter = "ALL" | TicketPriority;
type SortOption = "NEWEST" | "OLDEST" | "PRIORITY_HIGH" | "PRIORITY_LOW";

const API_URL = "https://supportai-3v3x.onrender.com/api";

const priorityRank: Record<TicketPriority, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");
  const [priorityFilter, setPriorityFilter] =
    useState<PriorityFilter>("ALL");
  const [sortOption, setSortOption] =
    useState<SortOption>("NEWEST");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] =
    useState<TicketPriority>("MEDIUM");

  useEffect(() => {
    const storedUser = localStorage.getItem("supportai_user");

    if (!storedUser) {
      localStorage.removeItem("supportai_token");
      navigate("/login", { replace: true });
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser) as User;

      if (!parsedUser.id) {
        throw new Error("Invalid user information.");
      }

      setUser(parsedUser);
      void fetchTickets(parsedUser.id);
    } catch {
      localStorage.removeItem("supportai_token");
      localStorage.removeItem("supportai_user");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const fetchTickets = async (userId: string) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/tickets/user/${userId}`
      );

      const data = (await response.json()) as TicketsResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load tickets.");
      }

      setTickets(data.tickets ?? []);
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

  const statistics = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "OPEN")
        .length,
      pending: tickets.filter(
        (ticket) => ticket.status === "PENDING"
      ).length,
      closed: tickets.filter(
        (ticket) => ticket.status === "CLOSED"
      ).length,
    };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    const result = tickets.filter((ticket) => {
      const matchesSearch =
        !normalizedSearch ||
        ticket.title.toLowerCase().includes(normalizedSearch) ||
        ticket.description
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" ||
        ticket.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ||
        ticket.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });

    return [...result].sort((firstTicket, secondTicket) => {
      switch (sortOption) {
        case "OLDEST":
          return (
            new Date(firstTicket.createdAt).getTime() -
            new Date(secondTicket.createdAt).getTime()
          );

        case "PRIORITY_HIGH":
          return (
            priorityRank[secondTicket.priority] -
            priorityRank[firstTicket.priority]
          );

        case "PRIORITY_LOW":
          return (
            priorityRank[firstTicket.priority] -
            priorityRank[secondTicket.priority]
          );

        case "NEWEST":
        default:
          return (
            new Date(secondTicket.createdAt).getTime() -
            new Date(firstTicket.createdAt).getTime()
          );
      }
    });
  }, [
    tickets,
    searchQuery,
    statusFilter,
    priorityFilter,
    sortOption,
  ]);

  const resetTicketForm = () => {
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
  };

  const handleCreateTicket = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!user) {
      setError("User information is unavailable.");
      return;
    }

    try {
      setCreating(true);
      setError("");
      setSuccessMessage("");

      const response = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          priority,
          userId: user.id,
        }),
      });

      const data =
        (await response.json()) as CreateTicketResponse;

      if (!response.ok || !data.success || !data.ticket) {
        throw new Error(
          data.message || "Unable to create the ticket."
        );
      }

      setTickets((currentTickets) => [
        data.ticket as Ticket,
        ...currentTickets,
      ]);

      resetTicketForm();
      setShowCreateForm(false);
      setSuccessMessage("Ticket created successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create the ticket."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("supportai_token");
    localStorage.removeItem("supportai_user");
    navigate("/login", { replace: true });
    window.location.reload();
  };

  const openCreateForm = () => {
    setShowCreateForm(true);
    setError("");
    setSuccessMessage("");
  };

  const closeCreateForm = () => {
    setShowCreateForm(false);
    resetTicketForm();
    setError("");
  };

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              SupportAI Dashboard
            </h1>

            <p className="dashboard-subtitle">
              Welcome back
              {user?.name ? `, ${user.name}` : ""}. Manage and
              track your support requests.
            </p>
          </div>

          <div className="dashboard-user-actions">
            <button
              className="dashboard-create-button"
              type="button"
              onClick={openCreateForm}
            >
              + Create Ticket
            </button>

            <button
              className="dashboard-logout-button"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {user && (
          <section className="dashboard-user-card">
            <p>
              <strong>Email:</strong> {user.email}
            </p>

            <p>
              <strong>Role:</strong> {user.role}
            </p>
          </section>
        )}

        <section
          className="dashboard-stats-grid"
          aria-label="Ticket statistics"
        >
          <article className="dashboard-stat-card">
            <p className="dashboard-stat-label">
              Total Tickets
            </p>

            <p className="dashboard-stat-value">
              {statistics.total}
            </p>
          </article>

          <article className="dashboard-stat-card open">
            <p className="dashboard-stat-label">
              Open Tickets
            </p>

            <p className="dashboard-stat-value">
              {statistics.open}
            </p>
          </article>

          <article className="dashboard-stat-card pending">
            <p className="dashboard-stat-label">
              Pending Tickets
            </p>

            <p className="dashboard-stat-value">
              {statistics.pending}
            </p>
          </article>

          <article className="dashboard-stat-card closed">
            <p className="dashboard-stat-label">
              Closed Tickets
            </p>

            <p className="dashboard-stat-value">
              {statistics.closed}
            </p>
          </article>
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2 className="dashboard-panel-title">
              My Tickets
            </h2>

            <p className="dashboard-result-count">
              Showing {filteredTickets.length} of{" "}
              {tickets.length} tickets
            </p>
          </div>

          <div className="dashboard-toolbar">
            <div className="dashboard-search-wrapper">
              <span className="dashboard-search-icon">
                🔍
              </span>

              <input
                className="dashboard-search-input"
                type="search"
                placeholder="Search by title or description..."
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
              />
            </div>

            <select
              className="dashboard-filter-select"
              aria-label="Filter by status"
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
              className="dashboard-filter-select"
              aria-label="Filter by priority"
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event.target.value as PriorityFilter
                )
              }
            >
              <option value="ALL">All priorities</option>
              <option value="LOW">Low priority</option>
              <option value="MEDIUM">
                Medium priority
              </option>
              <option value="HIGH">High priority</option>
            </select>

            <select
              className="dashboard-filter-select"
              aria-label="Sort tickets"
              value={sortOption}
              onChange={(event) =>
                setSortOption(
                  event.target.value as SortOption
                )
              }
            >
              <option value="NEWEST">Newest first</option>
              <option value="OLDEST">Oldest first</option>
              <option value="PRIORITY_HIGH">
                Priority: high to low
              </option>
              <option value="PRIORITY_LOW">
                Priority: low to high
              </option>
            </select>
          </div>

          {showCreateForm && (
            <form
              className="dashboard-ticket-form"
              onSubmit={handleCreateTicket}
            >
              <h3>Create a New Ticket</h3>

              <div className="dashboard-form-group">
                <label htmlFor="ticket-title">
                  Ticket title
                </label>

                <input
                  id="ticket-title"
                  type="text"
                  placeholder="Example: Unable to reset password"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  required
                />
              </div>

              <div className="dashboard-form-group">
                <label htmlFor="ticket-description">
                  Description
                </label>

                <textarea
                  id="ticket-description"
                  placeholder="Describe the problem in detail..."
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  required
                />
              </div>

              <div className="dashboard-form-group">
                <label htmlFor="ticket-priority">
                  Priority
                </label>

                <select
                  id="ticket-priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target
                        .value as TicketPriority
                    )
                  }
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div className="dashboard-form-actions">
                <button
                  className="dashboard-form-cancel"
                  type="button"
                  onClick={closeCreateForm}
                >
                  Cancel
                </button>

                <button
                  className="dashboard-form-submit"
                  type="submit"
                  disabled={
                    creating ||
                    !title.trim() ||
                    !description.trim()
                  }
                >
                  {creating
                    ? "Creating..."
                    : "Submit Ticket"}
                </button>
              </div>
            </form>
          )}

          {successMessage && (
            <p className="dashboard-success">
              {successMessage}
            </p>
          )}

          {error && (
            <p className="dashboard-error">{error}</p>
          )}

          {loading && (
            <div className="dashboard-loading">
              <p>Loading tickets...</p>
            </div>
          )}

          {!loading &&
            !error &&
            filteredTickets.length === 0 && (
              <div className="dashboard-empty-state">
                <div className="dashboard-empty-icon">
                  📭
                </div>

                <h3>No tickets found</h3>

                <p>
                  {tickets.length === 0
                    ? "Create your first support ticket."
                    : "Try changing your search or filters."}
                </p>
              </div>
            )}

          {!loading && filteredTickets.length > 0 && (
            <div className="dashboard-ticket-list">
              {filteredTickets.map((ticket) => (
                <Link
                  className="dashboard-ticket-link"
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                >
                  <article className="dashboard-ticket-card">
                    <div className="dashboard-ticket-top">
                      <h3 className="dashboard-ticket-title">
                        {ticket.title}
                      </h3>

                      <div className="dashboard-ticket-badges">
                        <span
                          className={`dashboard-status-badge dashboard-status-${ticket.status.toLowerCase()}`}
                        >
                          {ticket.status}
                        </span>

                        <span
                          className={`dashboard-priority-badge dashboard-priority-${ticket.priority.toLowerCase()}`}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                    </div>

                    <p className="dashboard-ticket-description">
                      {ticket.description}
                    </p>

                    <div className="dashboard-ticket-footer">
                      <span>
                        Created{" "}
                        {new Date(
                          ticket.createdAt
                        ).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>

                      <span className="dashboard-view-link">
                        View details →
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
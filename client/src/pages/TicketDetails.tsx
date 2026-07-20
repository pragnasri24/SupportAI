import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import "../styles/ticket-details.css";

type TicketStatus = "OPEN" | "PENDING" | "CLOSED";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH";

type TicketUser = {
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
  createdAt: string;
  updatedAt: string;
  user?: TicketUser;
};

type TicketResponse = {
  success: boolean;
  message?: string;
  ticket?: Ticket;
};

type DeleteResponse = {
  success: boolean;
  message?: string;
};

type CommentUser = {
  id: string;
  name: string;
  email?: string;
  role: string;
};

type TicketComment = {
  id: string;
  message: string;
  ticketId: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
  user: CommentUser;
};

type CommentsResponse = {
  success: boolean;
  message?: string;
  comments?: TicketComment[];
};

type CreateCommentResponse = {
  success: boolean;
  message?: string;
  comment?: TicketComment;
};

type StoredUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const API_URL = "https://supportai-3v3x.onrender.com/api";

function TicketDetails() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | null>(null);

  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingTicket, setUpdatingTicket] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedStatus, setSelectedStatus] =
    useState<TicketStatus>("OPEN");

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] =
    useState<TicketPriority>("MEDIUM");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [comments, setComments] = useState<TicketComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [commentError, setCommentError] = useState("");

  useEffect(() => {
    if (!ticketId) {
      setError("Ticket ID is missing.");
      setLoading(false);
      return;
    }

    void fetchTicket(ticketId);
  }, [ticketId]);

  const fetchComments = async (id: string) => {
    try {
      setCommentsLoading(true);
      setCommentError("");

      const response = await fetch(`${API_URL}/comments/ticket/${id}`);
      const data = (await response.json()) as CommentsResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load conversation.");
      }

      setComments(data.comments ?? []);
    } catch (err) {
      setCommentError(
        err instanceof Error ? err.message : "Unable to load conversation."
      );
    } finally {
      setCommentsLoading(false);
    }
  };

  const fetchTicket = async (id: string) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/tickets/${id}`);
      const data = (await response.json()) as TicketResponse;

      if (!response.ok || !data.success || !data.ticket) {
        throw new Error(data.message || "Unable to load ticket.");
      }

      setTicket(data.ticket);
      setSelectedStatus(data.ticket.status);

      setEditTitle(data.ticket.title);
      setEditDescription(data.ticket.description);
      setEditPriority(data.ticket.priority);

      await fetchComments(id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load ticket."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!ticket || !commentText.trim()) {
      return;
    }

    const storedUserValue = localStorage.getItem("supportai_user");

    if (!storedUserValue) {
      setCommentError("Please log in again before sending a reply.");
      return;
    }

    let storedUser: StoredUser;

    try {
      storedUser = JSON.parse(storedUserValue) as StoredUser;
    } catch {
      setCommentError("Your saved login information is invalid. Please log in again.");
      return;
    }

    if (!storedUser.id) {
      setCommentError("User ID is missing. Please log in again.");
      return;
    }

    try {
      setSendingComment(true);
      setCommentError("");

      const response = await fetch(`${API_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: commentText.trim(),
          ticketId: ticket.id,
          userId: storedUser.id,
        }),
      });

      const data = (await response.json()) as CreateCommentResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to send reply.");
      }

      setCommentText("");
      await fetchComments(ticket.id);
    } catch (err) {
      setCommentError(
        err instanceof Error ? err.message : "Unable to send reply."
      );
    } finally {
      setSendingComment(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!ticket || selectedStatus === ticket.status) {
      return;
    }

    try {
      setUpdatingStatus(true);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_URL}/tickets/${ticket.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: selectedStatus,
          }),
        }
      );

      const data = (await response.json()) as TicketResponse;

      if (!response.ok || !data.success || !data.ticket) {
        throw new Error(
          data.message || "Unable to update ticket status."
        );
      }

      setTicket((currentTicket) =>
        currentTicket
          ? {
              ...currentTicket,
              status: data.ticket!.status,
              updatedAt: data.ticket!.updatedAt,
            }
          : currentTicket
      );

      setSuccessMessage("Ticket status updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update ticket status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleEditSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!ticket) {
      return;
    }

    try {
      setUpdatingTicket(true);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_URL}/tickets/${ticket.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editTitle.trim(),
            description: editDescription.trim(),
            priority: editPriority,
          }),
        }
      );

      const data = (await response.json()) as TicketResponse;

      if (!response.ok || !data.success || !data.ticket) {
        throw new Error(data.message || "Unable to update ticket.");
      }

      setTicket((currentTicket) =>
        currentTicket
          ? {
              ...currentTicket,
              title: data.ticket!.title,
              description: data.ticket!.description,
              priority: data.ticket!.priority,
              updatedAt: data.ticket!.updatedAt,
            }
          : currentTicket
      );

      setIsEditing(false);
      setSuccessMessage("Ticket updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update ticket."
      );
    } finally {
      setUpdatingTicket(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticket) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_URL}/tickets/${ticket.id}`,
        {
          method: "DELETE",
        }
      );

      const data = (await response.json()) as DeleteResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete ticket.");
      }

      setShowDeleteModal(false);
      navigate("/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete ticket."
      );
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const openEditForm = () => {
    if (!ticket) {
      return;
    }

    setEditTitle(ticket.title);
    setEditDescription(ticket.description);
    setEditPriority(ticket.priority);

    setError("");
    setSuccessMessage("");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    if (ticket) {
      setEditTitle(ticket.title);
      setEditDescription(ticket.description);
      setEditPriority(ticket.priority);
    }

    setIsEditing(false);
    setError("");
  };

  if (loading) {
    return (
      <main className="ticket-details-page">
        <div className="ticket-details-container">
          <div className="ticket-details-state">
            Loading ticket...
          </div>
        </div>
      </main>
    );
  }

  if (error && !ticket) {
    return (
      <main className="ticket-details-page">
        <div className="ticket-details-container">
          <div className="ticket-details-error">{error}</div>

          <Link
            className="ticket-details-back-link"
            to="/dashboard"
          >
            ← Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <main className="ticket-details-page">
      <div className="ticket-details-container">
        <Link
          className="ticket-details-back-link"
          to="/dashboard"
        >
          ← Back to dashboard
        </Link>

        <section className="ticket-details-card">
          <div className="ticket-details-header">
            <div>
              <p className="ticket-details-label">Support ticket</p>

              <h1 className="ticket-details-title">
                {ticket.title}
              </h1>
            </div>

            <div className="ticket-details-badges">
              <span
                className={`ticket-details-status ticket-details-status-${ticket.status.toLowerCase()}`}
              >
                {ticket.status}
              </span>

              <span
                className={`ticket-details-priority ticket-details-priority-${ticket.priority.toLowerCase()}`}
              >
                {ticket.priority}
              </span>
            </div>
          </div>

          {successMessage && (
            <div className="ticket-details-success">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="ticket-details-error">{error}</div>
          )}

          {!isEditing ? (
            <>
              <section className="ticket-details-section">
                <h2>Description</h2>

                <p className="ticket-details-description">
                  {ticket.description}
                </p>
              </section>

              <section className="ticket-conversation-section">
                <div className="ticket-conversation-header">
                  <div>
                    <p className="ticket-details-label">Conversation</p>
                    <h2>Replies</h2>
                  </div>

                  <span className="ticket-conversation-count">
                    {comments.length} {comments.length === 1 ? "reply" : "replies"}
                  </span>
                </div>

                {commentError && (
                  <div className="ticket-comment-error">{commentError}</div>
                )}

                <div className="ticket-comment-list">
                  {commentsLoading ? (
                    <p className="ticket-comment-empty">Loading conversation...</p>
                  ) : comments.length === 0 ? (
                    <div className="ticket-comment-empty">
                      <strong>No replies yet</strong>
                      <span>Start the conversation by sending the first reply.</span>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <article className="ticket-comment" key={comment.id}>
                        <div className="ticket-comment-avatar" aria-hidden="true">
                          {comment.user.name.trim().charAt(0).toUpperCase() || "U"}
                        </div>

                        <div className="ticket-comment-content">
                          <div className="ticket-comment-meta">
                            <div>
                              <strong>{comment.user.name}</strong>
                              <span className="ticket-comment-role">
                                {comment.user.role.toLowerCase()}
                              </span>
                            </div>

                            <time dateTime={comment.createdAt}>
                              {new Date(comment.createdAt).toLocaleString()}
                            </time>
                          </div>

                          <p>{comment.message}</p>
                        </div>
                      </article>
                    ))
                  )}
                </div>

                <form
                  className="ticket-comment-form"
                  onSubmit={handleCommentSubmit}
                >
                  <label htmlFor="ticket-comment-message">Write a reply</label>

                  <textarea
                    id="ticket-comment-message"
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder="Type your reply here..."
                    maxLength={2000}
                    disabled={sendingComment}
                  />

                  <div className="ticket-comment-form-footer">
                    <span>{commentText.length}/2000</span>

                    <button
                      type="submit"
                      disabled={sendingComment || !commentText.trim()}
                    >
                      {sendingComment ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                </form>
              </section>

              <section className="ticket-details-information">
                <div>
                  <span>Created</span>
                  <strong>
                    {new Date(ticket.createdAt).toLocaleString()}
                  </strong>
                </div>

                <div>
                  <span>Last updated</span>
                  <strong>
                    {new Date(ticket.updatedAt).toLocaleString()}
                  </strong>
                </div>

                {ticket.user && (
                  <>
                    <div>
                      <span>Created by</span>
                      <strong>{ticket.user.name}</strong>
                    </div>

                    <div>
                      <span>Email</span>
                      <strong>{ticket.user.email}</strong>
                    </div>
                  </>
                )}
              </section>

              <section className="ticket-details-status-section">
                <div>
                  <h2>Update Status</h2>

                  <p>
                    Change the current progress of this support
                    request.
                  </p>
                </div>

                <div className="ticket-details-status-controls">
                  <select
                    value={selectedStatus}
                    onChange={(event) =>
                      setSelectedStatus(
                        event.target.value as TicketStatus
                      )
                    }
                  >
                    <option value="OPEN">Open</option>
                    <option value="PENDING">Pending</option>
                    <option value="CLOSED">Closed</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleStatusUpdate}
                    disabled={
                      updatingStatus ||
                      selectedStatus === ticket.status
                    }
                  >
                    {updatingStatus
                      ? "Updating..."
                      : "Update Status"}
                  </button>
                </div>
              </section>

              <div className="ticket-details-actions">
                <button
                  className="ticket-details-edit-button"
                  type="button"
                  onClick={openEditForm}
                >
                  Edit Ticket
                </button>

                <button
                  className="ticket-details-delete-button"
                  type="button"
                  onClick={() => {
                    setError("");
                    setSuccessMessage("");
                    setShowDeleteModal(true);
                  }}
                >
                  Delete Ticket
                </button>
              </div>
            </>
          ) : (
            <form
              className="ticket-details-edit-form"
              onSubmit={handleEditSubmit}
            >
              <h2>Edit Ticket</h2>

              <div className="ticket-details-form-group">
                <label htmlFor="edit-ticket-title">
                  Ticket title
                </label>

                <input
                  id="edit-ticket-title"
                  type="text"
                  value={editTitle}
                  onChange={(event) =>
                    setEditTitle(event.target.value)
                  }
                  required
                />
              </div>

              <div className="ticket-details-form-group">
                <label htmlFor="edit-ticket-description">
                  Description
                </label>

                <textarea
                  id="edit-ticket-description"
                  value={editDescription}
                  onChange={(event) =>
                    setEditDescription(event.target.value)
                  }
                  required
                />
              </div>

              <div className="ticket-details-form-group">
                <label htmlFor="edit-ticket-priority">
                  Priority
                </label>

                <select
                  id="edit-ticket-priority"
                  value={editPriority}
                  onChange={(event) =>
                    setEditPriority(
                      event.target.value as TicketPriority
                    )
                  }
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div className="ticket-details-edit-actions">
                <button
                  className="ticket-details-cancel-button"
                  type="button"
                  onClick={cancelEdit}
                  disabled={updatingTicket}
                >
                  Cancel
                </button>

                <button
                  className="ticket-details-save-button"
                  type="submit"
                  disabled={
                    updatingTicket ||
                    !editTitle.trim() ||
                    !editDescription.trim()
                  }
                >
                  {updatingTicket
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>

      {showDeleteModal && (
        <div
          className="ticket-delete-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setShowDeleteModal(false);
            }
          }}
        >
          <div
            className="ticket-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-ticket-heading"
          >
            <div className="ticket-delete-icon">!</div>

            <h2 id="delete-ticket-heading">
              Delete this ticket?
            </h2>

            <p>
              This action cannot be undone. The ticket and its
              information will be permanently removed.
            </p>

            <div className="ticket-delete-actions">
              <button
                className="ticket-delete-cancel"
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                className="ticket-delete-confirm"
                type="button"
                onClick={handleDeleteTicket}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default TicketDetails;
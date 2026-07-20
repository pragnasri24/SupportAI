const API_URL = "https://supportai-3v3x.onrender.com/api/comments";

export async function getComments(ticketId: string) {
  const response = await fetch(`${API_URL}/ticket/${ticketId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch comments");
  }

  return response.json();
}

export async function createComment(
  ticketId: string,
  userId: string,
  message: string
) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ticketId,
      userId,
      message,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create comment");
  }

  return response.json();
}
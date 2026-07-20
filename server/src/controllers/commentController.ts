import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const createComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { message, ticketId, userId } = req.body;

    if (!message?.trim() || !ticketId || !userId) {
      res.status(400).json({
        success: false,
        message: "Message, ticketId, and userId are required.",
      });
      return;
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: String(ticketId) },
    });

    if (!ticket) {
      res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: String(userId) },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found.",
      });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        message: message.trim(),
        ticketId: String(ticketId),
        userId: String(userId),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Comment created successfully.",
      comment,
    });
  } catch (error) {
    console.error("Create comment error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create comment.",
    });
  }
};

export const getTicketComments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const ticketId = String(req.params.ticketId);

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
      return;
    }

    const comments = await prisma.comment.findMany({
      where: {
        ticketId,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("Get ticket comments error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve comments.",
    });
  }
};

export const deleteComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const commentId = String(req.params.commentId);

    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
      return;
    }

    await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully.",
    });
  } catch (error) {
    console.error("Delete comment error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete comment.",
    });
  }
};
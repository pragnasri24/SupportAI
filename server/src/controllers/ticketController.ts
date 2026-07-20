import type { Request, Response } from "express";

import {
  TicketPriority,
  TicketStatus,
} from "../generated/prisma/client";

import { prisma } from "../utils/prisma";
import { io } from "../server";
function getRouteParam(
  value: string | string[] | undefined
): string | null {
  if (
    typeof value === "string" &&
    value.trim()
  ) {
    return value.trim();
  }

  if (
    Array.isArray(value) &&
    typeof value[0] === "string" &&
    value[0].trim()
  ) {
    return value[0].trim();
  }

  return null;
}

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;

const ticketSummaryInclude = {
  user: {
    select: userSelect,
  },
  assignedAgent: {
    select: userSelect,
  },
  _count: {
    select: {
      comments: true,
    },
  },
} as const;

export const createTicket = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      title,
      description,
      userId,
      priority,
    } = req.body;

    if (
      typeof title !== "string" ||
      typeof description !== "string" ||
      typeof userId !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, and user ID are required.",
      });
    }

    const cleanTitle = title.trim();
    const cleanDescription =
      description.trim();
    const cleanUserId = userId.trim();

    if (
      !cleanTitle ||
      !cleanDescription ||
      !cleanUserId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, and user ID cannot be empty.",
      });
    }

    let selectedPriority: TicketPriority =
      TicketPriority.MEDIUM;

    if (priority !== undefined) {
      if (
        typeof priority !== "string" ||
        !Object.values(
          TicketPriority
        ).includes(
          priority as TicketPriority
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Priority must be LOW, MEDIUM, or HIGH.",
        });
      }

      selectedPriority =
        priority as TicketPriority;
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id: cleanUserId,
        },
        select: {
          id: true,
        },
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const ticket =
      await prisma.ticket.create({
        data: {
          title: cleanTitle,
          description: cleanDescription,
          userId: cleanUserId,
          priority: selectedPriority,
        },
        include: ticketSummaryInclude,
      });
io.emit("ticketCreated", ticket);
    return res.status(201).json({
      success: true,
      message:
        "Ticket created successfully.",
      ticket,
    });
  } catch (error) {
    console.error(
      "Create ticket error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create ticket.",
    });
  }
};

export const getAllTickets = async (
  _req: Request,
  res: Response
) => {
  try {
    const tickets =
      await prisma.ticket.findMany({
        include: ticketSummaryInclude,
        orderBy: {
          createdAt: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    console.error(
      "Get all tickets error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve tickets.",
    });
  }
};

export const getUserTickets = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getRouteParam(
      req.params.userId
    );

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const tickets =
      await prisma.ticket.findMany({
        where: {
          userId,
        },
        include: ticketSummaryInclude,
        orderBy: {
          createdAt: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    console.error(
      "Get user tickets error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve user tickets.",
    });
  }
};

export const getAgentTickets = async (
  req: Request,
  res: Response
) => {
  try {
    const agentId = getRouteParam(
      req.params.agentId
    );

    if (!agentId) {
      return res.status(400).json({
        success: false,
        message:
          "Agent ID is required.",
      });
    }

    const agent =
      await prisma.user.findUnique({
        where: {
          id: agentId,
        },
        select: {
          id: true,
          role: true,
        },
      });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found.",
      });
    }

    if (
      agent.role !== "AGENT" &&
      agent.role !== "ADMIN"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "The selected user is not an agent or administrator.",
      });
    }

    const tickets =
      await prisma.ticket.findMany({
        where: {
          assignedAgentId: agentId,
        },
        include: ticketSummaryInclude,
        orderBy: {
          updatedAt: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    console.error(
      "Get agent tickets error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve assigned tickets.",
    });
  }
};

export const getTicketById = async (
  req: Request,
  res: Response
) => {
  try {
    const ticketId = getRouteParam(
      req.params.ticketId
    );

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message:
          "Ticket ID is required.",
      });
    }

    const ticket =
      await prisma.ticket.findUnique({
        where: {
          id: ticketId,
        },
        include: {
          user: {
            select: userSelect,
          },
          assignedAgent: {
            select: userSelect,
          },
          comments: {
            include: {
              user: {
                select: userSelect,
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    return res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error(
      "Get ticket error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve ticket.",
    });
  }
};

export const updateTicket = async (
  req: Request,
  res: Response
) => {
  try {
    const ticketId = getRouteParam(
      req.params.ticketId
    );

    const {
      title,
      description,
      priority,
    } = req.body;

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message:
          "Ticket ID is required.",
      });
    }

    const existingTicket =
      await prisma.ticket.findUnique({
        where: {
          id: ticketId,
        },
        select: {
          id: true,
        },
      });

    if (!existingTicket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    if (
      title === undefined &&
      description === undefined &&
      priority === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Provide at least one field to update.",
      });
    }

    if (
      title !== undefined &&
      (typeof title !== "string" ||
        !title.trim())
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title cannot be empty.",
      });
    }

    if (
      description !== undefined &&
      (typeof description !== "string" ||
        !description.trim())
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Description cannot be empty.",
      });
    }

    if (
      priority !== undefined &&
      (typeof priority !== "string" ||
        !Object.values(
          TicketPriority
        ).includes(
          priority as TicketPriority
        ))
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Priority must be LOW, MEDIUM, or HIGH.",
      });
    }

    const ticket =
      await prisma.ticket.update({
        where: {
          id: ticketId,
        },
        data: {
          ...(typeof title === "string"
            ? {
                title: title.trim(),
              }
            : {}),
          ...(typeof description ===
          "string"
            ? {
                description:
                  description.trim(),
              }
            : {}),
          ...(typeof priority === "string"
            ? {
                priority:
                  priority as TicketPriority,
              }
            : {}),
        },
        include: ticketSummaryInclude,
      });

    return res.status(200).json({
      success: true,
      message:
        "Ticket updated successfully.",
      ticket,
    });
  } catch (error) {
    console.error(
      "Update ticket error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update ticket.",
    });
  }
};

export const updateTicketStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const ticketId = getRouteParam(
      req.params.ticketId
    );

    const { status } = req.body;

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message:
          "Ticket ID is required.",
      });
    }

    if (
      typeof status !== "string" ||
      !Object.values(
        TicketStatus
      ).includes(status as TicketStatus)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be OPEN, PENDING, or CLOSED.",
      });
    }

    const existingTicket =
      await prisma.ticket.findUnique({
        where: {
          id: ticketId,
        },
        select: {
          id: true,
        },
      });

    if (!existingTicket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    const ticket =
      await prisma.ticket.update({
        where: {
          id: ticketId,
        },
        data: {
          status:
            status as TicketStatus,
        },
        include: ticketSummaryInclude,
      });

    return res.status(200).json({
      success: true,
      message:
        "Ticket status updated successfully.",
      ticket,
    });
  } catch (error) {
    console.error(
      "Update ticket status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update ticket status.",
    });
  }
};

export const assignTicketToAgent =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const ticketId = getRouteParam(
        req.params.ticketId
      );

      const { agentId } = req.body;

      if (!ticketId) {
        return res.status(400).json({
          success: false,
          message:
            "Ticket ID is required.",
        });
      }

      if (
        typeof agentId !== "string" ||
        !agentId.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Agent ID is required.",
        });
      }

      const cleanAgentId =
        agentId.trim();

      const agent =
        await prisma.user.findUnique({
          where: {
            id: cleanAgentId,
          },
          select: userSelect,
        });

      if (!agent) {
        return res.status(404).json({
          success: false,
          message: "Agent not found.",
        });
      }

      if (
        agent.role !== "AGENT" &&
        agent.role !== "ADMIN"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only agents or administrators can be assigned tickets.",
        });
      }

      const existingTicket =
        await prisma.ticket.findUnique({
          where: {
            id: ticketId,
          },
          select: {
            id: true,
          },
        });

      if (!existingTicket) {
        return res.status(404).json({
          success: false,
          message:
            "Ticket not found.",
        });
      }

      const ticket =
        await prisma.ticket.update({
          where: {
            id: ticketId,
          },
          data: {
            assignedAgentId:
              cleanAgentId,
          },
          include:
            ticketSummaryInclude,
        });

      return res.status(200).json({
        success: true,
        message: `Ticket assigned to ${agent.name}.`,
        ticket,
      });
    } catch (error) {
      console.error(
        "Assign ticket error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to assign ticket.",
      });
    }
  };

export const unassignTicket = async (
  req: Request,
  res: Response
) => {
  try {
    const ticketId = getRouteParam(
      req.params.ticketId
    );

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message:
          "Ticket ID is required.",
      });
    }

    const existingTicket =
      await prisma.ticket.findUnique({
        where: {
          id: ticketId,
        },
        select: {
          id: true,
        },
      });

    if (!existingTicket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    const ticket =
      await prisma.ticket.update({
        where: {
          id: ticketId,
        },
        data: {
          assignedAgentId: null,
        },
        include: ticketSummaryInclude,
      });

    return res.status(200).json({
      success: true,
      message:
        "Ticket assignment removed.",
      ticket,
    });
  } catch (error) {
    console.error(
      "Unassign ticket error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to unassign ticket.",
    });
  }
};

export const deleteTicket = async (
  req: Request,
  res: Response
) => {
  try {
    const ticketId = getRouteParam(
      req.params.ticketId
    );

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message:
          "Ticket ID is required.",
      });
    }

    const existingTicket =
      await prisma.ticket.findUnique({
        where: {
          id: ticketId,
        },
        select: {
          id: true,
        },
      });

    if (!existingTicket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    await prisma.ticket.delete({
      where: {
        id: ticketId,
      },
    });

    return res.status(200).json({
      success: true,
      message:
        "Ticket deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete ticket error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete ticket.",
    });
  }
};
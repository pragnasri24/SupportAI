import { Router } from "express";

import {
  assignTicketToAgent,
  createTicket,
  deleteTicket,
  getAgentTickets,
  getAllTickets,
  getTicketById,
  getUserTickets,
  unassignTicket,
  updateTicket,
  updateTicketStatus,
} from "../controllers/ticketController";

const router = Router();

router.get("/", getAllTickets);

router.get(
  "/user/:userId",
  getUserTickets
);

router.get(
  "/agent/:agentId",
  getAgentTickets
);

router.post("/", createTicket);

router.patch(
  "/:ticketId/assign",
  assignTicketToAgent
);

router.patch(
  "/:ticketId/unassign",
  unassignTicket
);

router.patch(
  "/:ticketId/status",
  updateTicketStatus
);

router.put(
  "/:ticketId",
  updateTicket
);

router.delete(
  "/:ticketId",
  deleteTicket
);

router.get(
  "/:ticketId",
  getTicketById
);

export default router;
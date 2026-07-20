import { Router } from "express";
import {
  createComment,
  deleteComment,
  getTicketComments,
} from "../controllers/commentController";

const router = Router();

router.post("/", createComment);
router.get("/ticket/:ticketId", getTicketComments);
router.delete("/:commentId", deleteComment);

export default router;
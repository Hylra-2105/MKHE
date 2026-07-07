import express from "express";
import { createContact, getAllContacts, getContactById, updateContactStatus, deleteContact } from "./contact.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { checkRole } from "../../middlewares/checkRole.js";

const router = express.Router();

router.post("/", createContact);
router.get("/", verifyToken, checkRole(["Admin", "Staff"]), getAllContacts);
router.get("/:id", verifyToken, checkRole(["Admin", "Staff"]), getContactById);
router.put("/:id/status", verifyToken, checkRole(["Admin", "Staff"]), updateContactStatus);
router.delete("/:id", verifyToken, checkRole(["Admin", "Staff"]), deleteContact);

export default router;

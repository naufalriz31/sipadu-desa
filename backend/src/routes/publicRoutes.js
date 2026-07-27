import { Router } from "express";
import upload from "../middleware/upload.js";
import {
  createComplaint,
  checkStatus,
  getCategories,
  getMyComplaints,
  getComplaintPhoto,
} from "../controllers/complaintController.js";

import { login } from "../controllers/authController.js";
import { citizenLogin } from "../controllers/citizenController.js";
import { verifyCitizen } from "../middleware/citizenAuth.js";

const router = Router();

// Pengaduan (warga)
router.post("/complaints", verifyCitizen, upload.single("photo"), createComplaint);
router.get("/complaints/my-complaints", verifyCitizen, getMyComplaints);
router.get("/complaints/status/:ticket", checkStatus);
router.get("/complaints/:id/photo", getComplaintPhoto);
router.get("/categories", getCategories);


// Auth
router.post("/auth/login", login);
router.post("/auth/citizen-login", citizenLogin);

export default router;

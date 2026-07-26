import { Router } from "express";
import { verifyAdmin } from "../middleware/auth.js";
import {
  listComplaints,
  getComplaintDetail,
  updateStatus,
  getDashboardStats,
  deleteComplaint,
} from "../controllers/complaintController.js";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = Router();

// Semua route di bawah ini wajib login admin
router.use(verifyAdmin);

router.get("/dashboard", getDashboardStats);

router.get("/complaints", listComplaints);
router.get("/complaints/:id", getComplaintDetail);
router.patch("/complaints/:id/status", updateStatus);
router.delete("/complaints/:id", deleteComplaint);


router.get("/categories", listCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

export default router;

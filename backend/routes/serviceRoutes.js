import express from "express";
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  registerService,
  getUserServiceRegistrations,
} from "../controllers/serviceController.js";

const router = express.Router();

router.get("/", getAllServices);
router.get("/:id", getServiceById);
router.get("/user/:userId", getUserServiceRegistrations);
router.post("/", createService);
router.post("/register", registerService);
router.put("/:id", updateService);
router.delete("/:id", deleteService);

export default router;

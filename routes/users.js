const express = require("express");
const router = express.Router();
const UserStore = require("../models/userStore");
const CourseStore = require("../models/courseStore");
const { validateUser } = require("../middleware/validate");

// ─── GET /api/users ───────────────────────────────────────────────────────────
router.get("/", (req, res) => {
  const users = UserStore.getAll();
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// ─── GET /api/users/:id ───────────────────────────────────────────────────────
router.get("/:id", (req, res) => {
  const user = UserStore.getById(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  res.status(200).json({ success: true, data: user });
});

// ─── POST /api/users ──────────────────────────────────────────────────────────
router.post("/", validateUser, (req, res) => {
  const { name, email, role } = req.body;

  // Check for duplicate email
  const existing = UserStore.getByEmail(email);
  if (existing) {
    return res
      .status(409)
      .json({ success: false, error: "Email already registered" });
  }

  const user = UserStore.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    role,
  });

  res.status(201).json({ success: true, data: user });
});

// ─── PUT /api/users/:id ───────────────────────────────────────────────────────
router.put("/:id", (req, res) => {
  const existing = UserStore.getById(req.params.id);

  if (!existing) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  const updated = UserStore.update(req.params.id, req.body);
  res.status(200).json({ success: true, data: updated });
});

// ─── DELETE /api/users/:id ────────────────────────────────────────────────────
router.delete("/:id", (req, res) => {
  const deleted = UserStore.delete(req.params.id);

  if (!deleted) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  res
    .status(200)
    .json({ success: true, message: "User deleted successfully" });
});

// ─── POST /api/users/:id/enroll ───────────────────────────────────────────────
router.post("/:id/enroll", (req, res) => {
  const user = UserStore.getById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  const { courseId } = req.body;
  if (!courseId) {
    return res.status(400).json({ success: false, error: "courseId is required" });
  }

  const course = CourseStore.getById(courseId);
  if (!course) {
    return res.status(404).json({ success: false, error: "Course not found" });
  }

  if (user.enrolledCourses.includes(courseId)) {
    return res
      .status(409)
      .json({ success: false, error: "Already enrolled in this course" });
  }

  const updated = UserStore.update(req.params.id, {
    enrolledCourses: [...user.enrolledCourses, courseId],
  });

  res.status(200).json({ success: true, data: updated });
});

module.exports = router;

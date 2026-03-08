const express = require("express");
const router = express.Router();
const CourseStore = require("../models/courseStore");
const { validateCourse } = require("../middleware/validate");

// ─── GET /api/courses ─────────────────────────────────────────────────────────
// Returns all courses, with optional ?category= filter
router.get("/", (req, res) => {
  let courses = CourseStore.getAll();

  if (req.query.category) {
    courses = courses.filter(
      (c) =>
        c.category.toLowerCase() === req.query.category.toLowerCase()
    );
  }

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

// ─── GET /api/courses/:id ─────────────────────────────────────────────────────
router.get("/:id", (req, res) => {
  const course = CourseStore.getById(req.params.id);

  if (!course) {
    return res.status(404).json({ success: false, error: "Course not found" });
  }

  res.status(200).json({ success: true, data: course });
});

// ─── POST /api/courses ────────────────────────────────────────────────────────
router.post("/", validateCourse, (req, res) => {
  const { title, description, instructor, duration, price, category } =
    req.body;

  const course = CourseStore.create({
    title: title.trim(),
    description: description.trim(),
    instructor: instructor.trim(),
    duration,
    price,
    category: category.trim(),
  });

  res.status(201).json({ success: true, data: course });
});

// ─── PUT /api/courses/:id ─────────────────────────────────────────────────────
router.put("/:id", (req, res) => {
  const existing = CourseStore.getById(req.params.id);

  if (!existing) {
    return res.status(404).json({ success: false, error: "Course not found" });
  }

  const updated = CourseStore.update(req.params.id, req.body);
  res.status(200).json({ success: true, data: updated });
});

// ─── DELETE /api/courses/:id ──────────────────────────────────────────────────
router.delete("/:id", (req, res) => {
  const deleted = CourseStore.delete(req.params.id);

  if (!deleted) {
    return res.status(404).json({ success: false, error: "Course not found" });
  }

  res.status(200).json({ success: true, message: "Course deleted successfully" });
});

module.exports = router;

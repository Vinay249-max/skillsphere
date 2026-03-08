// ─── Course Validation ────────────────────────────────────────────────────────

/**
 * Validates required fields when creating a course.
 */
const validateCourse = (req, res, next) => {
  const { title, description, instructor, duration, price, category } =
    req.body;

  const errors = [];

  if (!title || typeof title !== "string" || title.trim() === "") {
    errors.push("title is required and must be a non-empty string");
  }
  if (
    !description ||
    typeof description !== "string" ||
    description.trim() === ""
  ) {
    errors.push("description is required and must be a non-empty string");
  }
  if (
    !instructor ||
    typeof instructor !== "string" ||
    instructor.trim() === ""
  ) {
    errors.push("instructor is required and must be a non-empty string");
  }
  if (duration === undefined || typeof duration !== "number" || duration <= 0) {
    errors.push("duration is required and must be a positive number");
  }
  if (price === undefined || typeof price !== "number" || price < 0) {
    errors.push("price is required and must be a non-negative number");
  }
  if (!category || typeof category !== "string" || category.trim() === "") {
    errors.push("category is required and must be a non-empty string");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

// ─── User Validation ──────────────────────────────────────────────────────────

/**
 * Validates required fields when creating a user.
 */
const validateUser = (req, res, next) => {
  const { name, email, role } = req.body;

  const errors = [];

  if (!name || typeof name !== "string" || name.trim() === "") {
    errors.push("name is required and must be a non-empty string");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push("a valid email is required");
  }

  const validRoles = ["student", "instructor", "admin"];
  if (!role || !validRoles.includes(role)) {
    errors.push(`role is required and must be one of: ${validRoles.join(", ")}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = { validateCourse, validateUser };

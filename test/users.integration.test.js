/**
 * Challenge 2 — Integration Tests
 * Tool: SuperTest (simulates real HTTP requests through the full middleware stack)
 * Coverage: /api/users endpoints — full lifecycle + middleware interaction
 *
 * Run with:
 *   npm test
 */

const request = require("supertest");
const { expect } = require("chai");
const app = require("../app");
const UserStore = require("../models/userStore");
const CourseStore = require("../models/courseStore");

// ─────────────────────────────────────────────────────────────────────────────
describe("Integration Tests — /api/users", () => {
  // Reset both stores before each test
  beforeEach(() => {
    UserStore.reset();
    CourseStore.reset();
  });

  // ── GET /api/users ──────────────────────────────────────────────────────────
  describe("GET /api/users", () => {
    it("should pass through middleware and return all users", async () => {
      const res = await request(app).get("/api/users");

      expect(res.status).to.equal(200);
      expect(res.headers["content-type"]).to.match(/application\/json/);
      expect(res.body.success).to.equal(true);
      expect(res.body.data).to.be.an("array").with.lengthOf(2);
    });

    it("should return users with correct data shape", async () => {
      const res = await request(app).get("/api/users");

      const user = res.body.data[0];
      expect(user).to.include.keys(
        "id", "name", "email", "role", "enrolledCourses", "createdAt"
      );
    });

    it("count field should match data array length", async () => {
      const res = await request(app).get("/api/users");

      expect(res.body.count).to.equal(res.body.data.length);
    });
  });

  // ── GET /api/users/:id ──────────────────────────────────────────────────────
  describe("GET /api/users/:id", () => {
    it("should return the correct user by id", async () => {
      const res = await request(app).get("/api/users/1");

      expect(res.status).to.equal(200);
      expect(res.body.data.id).to.equal("1");
      expect(res.body.data.name).to.equal("John Doe");
    });

    it("should return 404 for a non-existent user id", async () => {
      const res = await request(app).get("/api/users/9999");

      expect(res.status).to.equal(404);
      expect(res.body.success).to.equal(false);
      expect(res.body.error).to.equal("User not found");
    });
  });

  // ── POST /api/users ─────────────────────────────────────────────────────────
  describe("POST /api/users", () => {
    it("should create a user successfully and return 201", async () => {
      const newUser = {
        name: "New Student",
        email: "newstudent@example.com",
        role: "student",
      };

      const res = await request(app).post("/api/users").send(newUser);

      expect(res.status).to.equal(201);
      expect(res.body.success).to.equal(true);
      expect(res.body.data.name).to.equal("New Student");
      expect(res.body.data.email).to.equal("newstudent@example.com");
      expect(res.body.data.role).to.equal("student");
    });

    it("should initialize enrolledCourses as empty array for new users", async () => {
      const res = await request(app).post("/api/users").send({
        name: "Fresh User",
        email: "fresh@example.com",
        role: "student",
      });

      expect(res.body.data.enrolledCourses).to.be.an("array").with.lengthOf(0);
    });

    it("should reject duplicate email with 409 Conflict", async () => {
      const res = await request(app).post("/api/users").send({
        name: "Duplicate User",
        email: "john@example.com", // already exists in seed
        role: "student",
      });

      expect(res.status).to.equal(409);
      expect(res.body.error).to.equal("Email already registered");
    });

    it("should return 400 from validateUser middleware when name is missing", async () => {
      const res = await request(app).post("/api/users").send({
        email: "noname@example.com",
        role: "student",
      });

      expect(res.status).to.equal(400);
      expect(res.body.errors).to.be.an("array");
      expect(res.body.errors[0]).to.include("name");
    });

    it("should return 400 when email is invalid", async () => {
      const res = await request(app).post("/api/users").send({
        name: "Bad Email",
        email: "not-an-email",
        role: "student",
      });

      expect(res.status).to.equal(400);
      expect(res.body.errors[0]).to.include("email");
    });

    it("should return 400 when role is invalid", async () => {
      const res = await request(app).post("/api/users").send({
        name: "Bad Role",
        email: "badrole@example.com",
        role: "superuser",
      });

      expect(res.status).to.equal(400);
      expect(res.body.errors[0]).to.include("role");
    });

    it("should accept valid roles: student, instructor, admin", async () => {
      for (const role of ["student", "instructor", "admin"]) {
        UserStore.reset();
        const res = await request(app).post("/api/users").send({
          name: `${role} User`,
          email: `${role}@example.com`,
          role,
        });

        expect(res.status).to.equal(201);
        expect(res.body.data.role).to.equal(role);
      }
    });
  });

  // ── PUT /api/users/:id ──────────────────────────────────────────────────────
  describe("PUT /api/users/:id", () => {
    it("should update user fields and return 200", async () => {
      const res = await request(app).put("/api/users/1").send({ name: "John Updated" });

      expect(res.status).to.equal(200);
      expect(res.body.data.name).to.equal("John Updated");
    });

    it("should return 404 when updating a non-existent user", async () => {
      const res = await request(app)
        .put("/api/users/9999")
        .send({ name: "Ghost" });

      expect(res.status).to.equal(404);
    });
  });

  // ── DELETE /api/users/:id ───────────────────────────────────────────────────
  describe("DELETE /api/users/:id", () => {
    it("should delete a user and return 200 with success message", async () => {
      const res = await request(app).delete("/api/users/1");

      expect(res.status).to.equal(200);
      expect(res.body.success).to.equal(true);
      expect(res.body.message).to.equal("User deleted successfully");
    });

    it("should make deleted user inaccessible via GET", async () => {
      await request(app).delete("/api/users/1");
      const res = await request(app).get("/api/users/1");

      expect(res.status).to.equal(404);
    });

    it("should return 404 when deleting a non-existent user", async () => {
      const res = await request(app).delete("/api/users/9999");

      expect(res.status).to.equal(404);
    });
  });

  // ── POST /api/users/:id/enroll ──────────────────────────────────────────────
  describe("POST /api/users/:id/enroll (Integration — Users + Courses)", () => {
    it("should enroll a user in a course successfully", async () => {
      const res = await request(app)
        .post("/api/users/1/enroll")
        .send({ courseId: "3" }); // course 3 not in John's enrollments yet

      expect(res.status).to.equal(200);
      expect(res.body.data.enrolledCourses).to.include("3");
    });

    it("should return 409 when user already enrolled in course", async () => {
      const res = await request(app)
        .post("/api/users/1/enroll")
        .send({ courseId: "1" }); // John already has course 1

      expect(res.status).to.equal(409);
      expect(res.body.error).to.equal("Already enrolled in this course");
    });

    it("should return 404 when course does not exist", async () => {
      const res = await request(app)
        .post("/api/users/1/enroll")
        .send({ courseId: "9999" });

      expect(res.status).to.equal(404);
      expect(res.body.error).to.equal("Course not found");
    });

    it("should return 404 when user does not exist", async () => {
      const res = await request(app)
        .post("/api/users/9999/enroll")
        .send({ courseId: "1" });

      expect(res.status).to.equal(404);
      expect(res.body.error).to.equal("User not found");
    });

    it("should return 400 when courseId is missing", async () => {
      const res = await request(app).post("/api/users/1/enroll").send({});

      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal("courseId is required");
    });
  });

  // ── Full User Lifecycle Integration Test ────────────────────────────────────
  describe("Full User Lifecycle", () => {
    it("should create → read → update → delete a user successfully", async () => {
      // 1. Create
      const createRes = await request(app).post("/api/users").send({
        name: "Lifecycle User",
        email: "lifecycle@example.com",
        role: "student",
      });
      expect(createRes.status).to.equal(201);
      const userId = createRes.body.data.id;

      // 2. Read
      const getRes = await request(app).get(`/api/users/${userId}`);
      expect(getRes.status).to.equal(200);
      expect(getRes.body.data.name).to.equal("Lifecycle User");

      // 3. Update
      const updateRes = await request(app)
        .put(`/api/users/${userId}`)
        .send({ name: "Updated Lifecycle User" });
      expect(updateRes.status).to.equal(200);
      expect(updateRes.body.data.name).to.equal("Updated Lifecycle User");

      // 4. Delete
      const deleteRes = await request(app).delete(`/api/users/${userId}`);
      expect(deleteRes.status).to.equal(200);

      // 5. Verify deleted
      const finalRes = await request(app).get(`/api/users/${userId}`);
      expect(finalRes.status).to.equal(404);
    });
  });
});

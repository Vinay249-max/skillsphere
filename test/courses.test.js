/**
 * Challenge 1 — Unit Tests
 * Tool: Mocha + Chai
 * Coverage: /api/courses routes — all CRUD operations
 *
 * Run with:
 *   npm test
 */

const { expect } = require("chai");
const request = require("supertest");
const app = require("../app");
const CourseStore = require("../models/courseStore");

// ─── Helper ───────────────────────────────────────────────────────────────────
const validCourse = {
  title: "Test Course",
  description: "A test course description",
  instructor: "Test Instructor",
  duration: 5,
  price: 29.99,
  category: "Testing",
};

// ─────────────────────────────────────────────────────────────────────────────
describe("Unit Tests — /api/courses", () => {
  // Reset store before each test for isolation
  beforeEach(() => {
    CourseStore.reset();
  });

  // ── GET /api/courses ────────────────────────────────────────────────────────
  describe("GET /api/courses", () => {
    it("should return 200 and an array of all courses", async () => {
      const res = await request(app).get("/api/courses");

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("success", true);
      expect(res.body).to.have.property("data").that.is.an("array");
      expect(res.body.data).to.have.lengthOf(3); // seed data
    });

    it("should include count matching the number of courses returned", async () => {
      const res = await request(app).get("/api/courses");

      expect(res.body.count).to.equal(res.body.data.length);
    });

    it("should filter courses by category using ?category= query param", async () => {
      const res = await request(app).get("/api/courses?category=Frontend");

      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an("array").with.lengthOf(1);
      expect(res.body.data[0].category).to.equal("Frontend");
    });

    it("should return empty array for non-existent category", async () => {
      const res = await request(app).get("/api/courses?category=NonExistent");

      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an("array").with.lengthOf(0);
      expect(res.body.count).to.equal(0);
    });

    it("each course should have required fields", async () => {
      const res = await request(app).get("/api/courses");
      const requiredFields = [
        "id", "title", "description", "instructor",
        "duration", "price", "category", "createdAt",
      ];

      res.body.data.forEach((course) => {
        requiredFields.forEach((field) => {
          expect(course).to.have.property(field);
        });
      });
    });
  });

  // ── GET /api/courses/:id ────────────────────────────────────────────────────
  describe("GET /api/courses/:id", () => {
    it("should return 200 and the correct course by id", async () => {
      const res = await request(app).get("/api/courses/1");

      expect(res.status).to.equal(200);
      expect(res.body.success).to.equal(true);
      expect(res.body.data).to.have.property("id", "1");
      expect(res.body.data.title).to.equal("JavaScript Fundamentals");
    });

    it("should return 404 when course id does not exist", async () => {
      const res = await request(app).get("/api/courses/9999");

      expect(res.status).to.equal(404);
      expect(res.body.success).to.equal(false);
      expect(res.body).to.have.property("error", "Course not found");
    });

    it("should return correct course data structure", async () => {
      const res = await request(app).get("/api/courses/2");

      expect(res.body.data).to.include.keys(
        "id", "title", "description", "instructor",
        "duration", "price", "category", "createdAt"
      );
    });
  });

  // ── POST /api/courses ───────────────────────────────────────────────────────
  describe("POST /api/courses", () => {
    it("should create a course and return 201 with the new course", async () => {
      const res = await request(app)
        .post("/api/courses")
        .send(validCourse);

      expect(res.status).to.equal(201);
      expect(res.body.success).to.equal(true);
      expect(res.body.data).to.have.property("id");
      expect(res.body.data.title).to.equal("Test Course");
      expect(res.body.data.instructor).to.equal("Test Instructor");
    });

    it("should persist the new course (accessible via GET)", async () => {
      const postRes = await request(app)
        .post("/api/courses")
        .send(validCourse);

      const newId = postRes.body.data.id;
      const getRes = await request(app).get(`/api/courses/${newId}`);

      expect(getRes.status).to.equal(200);
      expect(getRes.body.data.title).to.equal("Test Course");
    });

    it("should return 400 when title is missing", async () => {
      const { title, ...withoutTitle } = validCourse;
      const res = await request(app)
        .post("/api/courses")
        .send(withoutTitle);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("errors").that.is.an("array");
      expect(res.body.errors[0]).to.include("title");
    });

    it("should return 400 when price is negative", async () => {
      const res = await request(app)
        .post("/api/courses")
        .send({ ...validCourse, price: -10 });

      expect(res.status).to.equal(400);
      expect(res.body.errors[0]).to.include("price");
    });

    it("should return 400 when duration is zero or negative", async () => {
      const res = await request(app)
        .post("/api/courses")
        .send({ ...validCourse, duration: 0 });

      expect(res.status).to.equal(400);
      expect(res.body.errors[0]).to.include("duration");
    });

    it("should return 400 when multiple required fields are missing", async () => {
      const res = await request(app)
        .post("/api/courses")
        .send({ title: "Only Title" });

      expect(res.status).to.equal(400);
      expect(res.body.errors).to.have.length.greaterThan(1);
    });

    it("should auto-assign createdAt timestamp on creation", async () => {
      const res = await request(app)
        .post("/api/courses")
        .send(validCourse);

      expect(res.body.data).to.have.property("createdAt");
      const createdAt = new Date(res.body.data.createdAt);
      expect(createdAt).to.be.instanceOf(Date);
      expect(isNaN(createdAt.getTime())).to.equal(false);
    });
  });

  // ── PUT /api/courses/:id ────────────────────────────────────────────────────
  describe("PUT /api/courses/:id", () => {
    it("should update an existing course and return 200", async () => {
      const res = await request(app)
        .put("/api/courses/1")
        .send({ title: "Updated JavaScript Course", price: 79.99 });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.equal(true);
      expect(res.body.data.title).to.equal("Updated JavaScript Course");
      expect(res.body.data.price).to.equal(79.99);
    });

    it("should preserve fields not included in the update payload", async () => {
      const res = await request(app)
        .put("/api/courses/1")
        .send({ title: "New Title" });

      expect(res.body.data.instructor).to.equal("Alice Johnson");
      expect(res.body.data.category).to.equal("Programming");
    });

    it("should return 404 when updating a non-existent course", async () => {
      const res = await request(app)
        .put("/api/courses/9999")
        .send({ title: "Ghost Course" });

      expect(res.status).to.equal(404);
      expect(res.body.error).to.equal("Course not found");
    });
  });

  // ── DELETE /api/courses/:id ─────────────────────────────────────────────────
  describe("DELETE /api/courses/:id", () => {
    it("should delete an existing course and return 200", async () => {
      const res = await request(app).delete("/api/courses/1");

      expect(res.status).to.equal(200);
      expect(res.body.success).to.equal(true);
      expect(res.body.message).to.equal("Course deleted successfully");
    });

    it("should make deleted course inaccessible via GET", async () => {
      await request(app).delete("/api/courses/1");
      const res = await request(app).get("/api/courses/1");

      expect(res.status).to.equal(404);
    });

    it("should reduce the total course count by one", async () => {
      const before = await request(app).get("/api/courses");
      await request(app).delete("/api/courses/1");
      const after = await request(app).get("/api/courses");

      expect(after.body.count).to.equal(before.body.count - 1);
    });

    it("should return 404 when deleting a non-existent course", async () => {
      const res = await request(app).delete("/api/courses/9999");

      expect(res.status).to.equal(404);
      expect(res.body.error).to.equal("Course not found");
    });
  });

  // ── Status Route ────────────────────────────────────────────────────────────
  describe("GET /status", () => {
    it("should return 200 with App is live message", async () => {
      const res = await request(app).get("/status");

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal("App is live");
    });
  });

  // ── 404 Fallback ────────────────────────────────────────────────────────────
  describe("Unknown Routes", () => {
    it("should return 404 for undefined routes", async () => {
      const res = await request(app).get("/api/unknown-route");

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("error");
    });
  });
});

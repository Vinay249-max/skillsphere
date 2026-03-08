// In-memory data store — swap out for MongoDB/Mongoose in production
let courses = [
  {
    id: "1",
    title: "JavaScript Fundamentals",
    description: "Learn the core concepts of JavaScript.",
    instructor: "Alice Johnson",
    duration: 10,
    price: 49.99,
    category: "Programming",
    createdAt: new Date("2024-01-01").toISOString(),
  },
  {
    id: "2",
    title: "Node.js for Beginners",
    description: "Build server-side applications with Node.js.",
    instructor: "Bob Smith",
    duration: 8,
    price: 39.99,
    category: "Backend",
    createdAt: new Date("2024-02-01").toISOString(),
  },
  {
    id: "3",
    title: "React Masterclass",
    description: "Master React with hooks, context, and best practices.",
    instructor: "Carol White",
    duration: 15,
    price: 59.99,
    category: "Frontend",
    createdAt: new Date("2024-03-01").toISOString(),
  },
];

let nextId = 4;

const CourseStore = {
  getAll: () => [...courses],

  getById: (id) => courses.find((c) => c.id === id) || null,

  create: (data) => {
    const course = {
      id: String(nextId++),
      ...data,
      createdAt: new Date().toISOString(),
    };
    courses.push(course);
    return course;
  },

  update: (id, data) => {
    const index = courses.findIndex((c) => c.id === id);
    if (index === -1) return null;
    courses[index] = { ...courses[index], ...data };
    return courses[index];
  },

  delete: (id) => {
    const index = courses.findIndex((c) => c.id === id);
    if (index === -1) return false;
    courses.splice(index, 1);
    return true;
  },

  // Reset for tests
  reset: () => {
    courses = [
      {
        id: "1",
        title: "JavaScript Fundamentals",
        description: "Learn the core concepts of JavaScript.",
        instructor: "Alice Johnson",
        duration: 10,
        price: 49.99,
        category: "Programming",
        createdAt: new Date("2024-01-01").toISOString(),
      },
      {
        id: "2",
        title: "Node.js for Beginners",
        description: "Build server-side applications with Node.js.",
        instructor: "Bob Smith",
        duration: 8,
        price: 39.99,
        category: "Backend",
        createdAt: new Date("2024-02-01").toISOString(),
      },
      {
        id: "3",
        title: "React Masterclass",
        description: "Master React with hooks, context, and best practices.",
        instructor: "Carol White",
        duration: 15,
        price: 59.99,
        category: "Frontend",
        createdAt: new Date("2024-03-01").toISOString(),
      },
    ];
    nextId = 4;
  },
};

module.exports = CourseStore;

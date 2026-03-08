// In-memory user store — swap for MongoDB/Mongoose in production
let users = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "student",
    enrolledCourses: ["1", "2"],
    createdAt: new Date("2024-01-10").toISOString(),
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "instructor",
    enrolledCourses: [],
    createdAt: new Date("2024-01-15").toISOString(),
  },
];

let nextId = 3;

const UserStore = {
  getAll: () => [...users],

  getById: (id) => users.find((u) => u.id === id) || null,

  getByEmail: (email) => users.find((u) => u.email === email) || null,

  create: (data) => {
    const user = {
      id: String(nextId++),
      ...data,
      enrolledCourses: [],
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    return user;
  },

  update: (id, data) => {
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...data };
    return users[index];
  },

  delete: (id) => {
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    users.splice(index, 1);
    return true;
  },

  // Reset for tests
  reset: () => {
    users = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        role: "student",
        enrolledCourses: ["1", "2"],
        createdAt: new Date("2024-01-10").toISOString(),
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        role: "instructor",
        enrolledCourses: [],
        createdAt: new Date("2024-01-15").toISOString(),
      },
    ];
    nextId = 3;
  },
};

module.exports = UserStore;

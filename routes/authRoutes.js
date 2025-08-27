import User from "../models/user.js";
import { hashPassword, comparePasswords, generateToken } from "../utils/auth.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

export default async function authRoutes(fastify, options) {
  // Register
  fastify.post("/register", async (req, reply) => {
    try {
      const { username, password } = req.body;

      if (!username || !password || password.length < 6) {
        return reply.code(400).send({ error: "Username and password (min 6 chars) required" });
      }

      const existing = await User.findOne({ where: { username } });
      if (existing) return reply.code(400).send({ error: "Username already taken" });

      const hashed = await hashPassword(password);
      const user = await User.create({ username, password: hashed });

      return reply.send({ message: "User registered successfully", user: { id: user.id, username: user.username } });
    } catch (err) {
      console.error("Registration error:", err);
      return reply.code(500).send({ error: "Server error during registration" });
    }
  });

  // Login
  fastify.post("/login", async (req, reply) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ where: { username } });

      if (!user) return reply.code(401).send({ error: "Invalid credentials" });

      const valid = await comparePasswords(password, user.password);
      if (!valid) return reply.code(401).send({ error: "Invalid credentials" });

      const token = generateToken(user);
      return reply.send({ message: "Login successful", token });
    } catch (err) {
      console.error("Login error:", err);
      return reply.code(500).send({ error: "Server error during login" });
    }
  });

  // Protected route
  fastify.get("/profile", { preHandler: authMiddleware }, async (req, reply) => {
    return reply.send({ message: "Welcome to your profile!", user: req.user });
  });
}

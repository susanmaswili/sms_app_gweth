import Admin from "../models/admin.js";
import { generateToken, comparePasswords } from "../utils/auth.js";
import User from "../models/user.js";
import { authMiddleware } from '../middleware/authMiddleware.js';

export default async function authRoutes(fastify, options) {
  // Admin Login
  fastify.post('/login', async (request, reply) => {
    const { username, password } = request.body;
  
    const user = await User.findOne({ where: { username } });
    console.log('Found user:', user);
  
    if (!user) {
      return reply.status(401).send({ error: 'User not found' });
    }
  
    const passwordMatch = await comparePasswords(password, user.password);
    console.log('Password match:', passwordMatch);
  
    if (!passwordMatch) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }
  
    const token = generateToken(user);
    return reply.send({ message: 'Login successful', token });
  });

  // Protected Route Example
  fastify.get("/protected", async (req, reply) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const verified = verifyToken(token);
    if (!verified) {
      return reply.code(403).send({ error: "Invalid token" });
    }

    reply.send({ message: "✅ Access granted!" });
  });

  fastify.get('/profile', { preHandler: authMiddleware }, async (request, reply) => {
    reply.send({ user: request.user });
  });
}

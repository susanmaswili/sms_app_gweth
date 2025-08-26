// routes/userRoutes.js
import Fastify from 'fastify';
import bcrypt from "bcrypt";
import User from '../models/user.js';

export default async function userRoutes(fastify, options) {
  // Register user
  fastify.post('/register', async (request, reply) => {
    const { username, password } = request.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ username, password: hashedPassword });
      reply.send({ message: 'User registered successfully', user });
    } catch (error) {
      console.error(error);
      reply.status(500).send({ message: 'Registration failed', error });
    }
  });
}

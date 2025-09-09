import Fastify from 'fastify';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import studentRoutes from './routes/studentRoutes.js';
import feeRoutes from './routes/feesRoutes.js';
import gradeRoutes from './routes/gradesRoutes.js';
import reportRoutes from './routes/reportsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import schoolItemRoutes from "./routes/schoolItemRoutes.js";
//import userRoutes from './routes/userRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifyFormbody from '@fastify/formbody';
import fastifyStatic from '@fastify/static';

dotenv.config();

const fastify = Fastify({ logger: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware plugins
fastify.register(fastifyMultipart);
fastify.register(fastifyFormbody);
fastify.register(fastifyCors, {
  origin: [
    'https://sms.gwethfoundation.com',  // your custom domain
    'https://sms-app-gweth.onrender.com', // Render fallback
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
});

// Serve uploads folder (with sendFile enabled)
fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'uploads'),
  prefix: '/uploads/',
});

// Serve Vue frontend
const frontendPath = path.join(__dirname, 'frontend', 'dist');

fastify.register(fastifyStatic, {
  root: frontendPath,
  prefix: '/',          // Serve at root
  decorateReply: false, // Avoid conflicts
  index: false          // We'll manually serve index.html
});

// Serve index.html at root URL
fastify.get('/', async (req, reply) => {
  return reply.sendFile('index.html', frontendPath);
});

// SPA Fallback for Vue Router paths
fastify.setNotFoundHandler((req, reply) => {
  return reply.sendFile('index.html', frontendPath);
});


// API Routes
fastify.register(authRoutes);
fastify.register(studentRoutes);
fastify.register(feeRoutes);
fastify.register(gradeRoutes);
fastify.register(reportRoutes);
fastify.register(schoolItemRoutes);
//fastify.register(userRoutes);

const PORT = process.env.PORT || 5000;

// Start server
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Database connected.');

    await sequelize.sync({ alter: false });
    console.log('✅ Database synced.');

    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
})();

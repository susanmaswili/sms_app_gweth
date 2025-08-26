import { verifyToken } from "../utils/auth.js";

export const authMiddleware = async (req, reply) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  const verified = verifyToken(token);
  if (!verified) {
    return reply.code(403).send({ error: "Invalid token" });
  }

  req.admin = verified; // Attach admin info to request
};

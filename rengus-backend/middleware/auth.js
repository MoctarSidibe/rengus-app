import jwt from 'jsonwebtoken';
import { pool } from '../utils/database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const result = await pool.query(
      `SELECT u.*, s.name as school_name 
       FROM users u 
       LEFT JOIN schools s ON u.school_id = s.id 
       WHERE u.id = $1`,
      [decoded.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'User not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const requireAdminOrSchool = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'school') {
    return res.status(403).json({ error: 'Admin or school access required' });
  }
  next();
};
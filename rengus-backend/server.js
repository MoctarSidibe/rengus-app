import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

// Import routes using ES module syntax
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import schoolRoutes from './routes/schools.js';
import studentRoutes from './routes/students.js';
import dossierRoutes from './routes/dossiers.js';
import examCenterRoutes from './routes/examCenters.js';

// Load environment variables
dotenv.config();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Verify database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to PostgreSQL database');
  release();
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// JWT verification middleware (placeholder - you need to implement proper JWT verification)
const authenticateToken = (req, res, next) => {
  // Skip authentication for auth routes and health check
  if (req.path.startsWith('/api/auth') || req.path === '/api/health') {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // In a real application, you would verify the JWT token here
  // For now, we'll just check if it exists
  // You should implement proper JWT verification using a library like jsonwebtoken
  try {
    // Placeholder for JWT verification
    // const user = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = user;
    
    // For testing purposes, we'll just continue
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Apply authentication middleware to all routes
app.use(authenticateToken);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/dossiers', dossierRoutes);
app.use('/api/exam-centers', examCenterRoutes);

// School statistics endpoint
app.get('/api/schools/:id/stats', async (req, res) => {
  try {
    const schoolId = req.params.id;
    
    // Get total students
    const studentsResult = await pool.query(
      'SELECT COUNT(*) FROM students WHERE school_id = $1',
      [schoolId]
    );
    
    // Get total dossiers
    const dossiersResult = await pool.query(
      'SELECT COUNT(*) FROM dossiers WHERE school_id = $1',
      [schoolId]
    );
    
    // Get completed dossiers
    const completedResult = await pool.query(
      `SELECT COUNT(*) FROM dossiers 
       WHERE school_id = $1 AND status = 'completed'`,
      [schoolId]
    );
    
    // Get in-progress dossiers
    const inProgressResult = await pool.query(
      `SELECT COUNT(*) FROM dossiers 
       WHERE school_id = $1 AND status = 'in_progress'`,
      [schoolId]
    );

    const stats = {
      totalStudents: parseInt(studentsResult.rows[0].count),
      totalDossiers: parseInt(dossiersResult.rows[0].count),
      completedDossiers: parseInt(completedResult.rows[0].count),
      inProgressDossiers: parseInt(inProgressResult.rows[0].count)
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching school stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Recent activity endpoint
app.get('/api/schools/:id/recent-activity', async (req, res) => {
  try {
    const schoolId = req.params.id;
    
    const activityResult = await pool.query(
      `SELECT 
        s.first_name || ' ' || s.last_name AS student_name,
        da.step_name,
        da.status,
        da.updated_at as date,
        CASE 
          WHEN da.status = 'completed' THEN 'completed'
          ELSE 'inprogress'
        END as type
      FROM dossier_activities da
      JOIN students s ON da.student_id = s.id
      WHERE s.school_id = $1
      ORDER BY da.updated_at DESC
      LIMIT 10`,
      [schoolId]
    );
    
    const recentActivity = activityResult.rows.map(row => ({
      studentName: row.student_name,
      stepName: row.step_name,
      status: row.status,
      date: row.date,
      type: row.type
    }));
    
    res.json(recentActivity);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Student dossier progress endpoint
app.get('/api/students/:id/dossier-progress', async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Get student info
    const studentResult = await pool.query(
      `SELECT 
        s.first_name || ' ' || s.last_name AS student_name,
        s.license_type
      FROM students s
      WHERE s.id = $1`,
      [studentId]
    );
    
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Get dossier steps
    const stepsResult = await pool.query(
      `SELECT 
        step_name,
        status,
        completed_date,
        result
      FROM dossier_steps
      WHERE student_id = $1
      ORDER BY step_order`,
      [studentId]
    );
    
    const dossier = {
      studentName: studentResult.rows[0].student_name,
      licenseType: studentResult.rows[0].license_type,
      steps: stepsResult.rows.map(row => ({
        stepName: row.step_name,
        completed: row.status === 'completed',
        completionDate: row.completed_date,
        result: row.result
      }))
    };
    
    res.json(dossier);
  } catch (error) {
    console.error('Error fetching dossier progress:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
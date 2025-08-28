import { pool } from '../utils/database.js';

export const getAllDossiers = async (req, res) => {
  try {
    let query = `
      SELECT d.*, 
      (SELECT COUNT(*) FROM dossier_steps WHERE dossier_id = d.id AND completed = true) as completed_steps,
      (SELECT COUNT(*) FROM dossier_steps WHERE dossier_id = d.id) as total_steps
      FROM dossiers d
    `;
    let params = [];

    // If user is a school, only return their dossiers
    if (req.user.role === 'school') {
      query += ' WHERE d.school_id = $1';
      params.push(req.user.school_id);
    }

    query += ' ORDER BY d.created_at DESC';

    const result = await pool.query(query, params);
    
    const dossiers = result.rows.map(dossier => ({
      ...dossier,
      progress: dossier.total_steps > 0 ? Math.round((dossier.completed_steps / dossier.total_steps) * 100) : 0
    }));
    
    res.json(dossiers);
  } catch (error) {
    console.error('Error fetching dossiers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDossiersBySchool = async (req, res) => {
  const { schoolId } = req.params;

  try {
    const result = await pool.query(
      `SELECT d.*, 
      (SELECT COUNT(*) FROM dossier_steps WHERE dossier_id = d.id AND completed = true) as completed_steps,
      (SELECT COUNT(*) FROM dossier_steps WHERE dossier_id = d.id) as total_steps
      FROM dossiers d
      WHERE d.school_id = $1
      ORDER BY d.created_at DESC`,
      [schoolId]
    );
    
    const dossiers = result.rows.map(dossier => ({
      ...dossier,
      progress: dossier.total_steps > 0 ? Math.round((dossier.completed_steps / dossier.total_steps) * 100) : 0
    }));
    
    res.json(dossiers);
  } catch (error) {
    console.error('Error fetching dossiers by school:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDossierById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT d.*, 
      (SELECT COUNT(*) FROM dossier_steps WHERE dossier_id = d.id AND completed = true) as completed_steps,
      (SELECT COUNT(*) FROM dossier_steps WHERE dossier_id = d.id) as total_steps
      FROM dossiers d
      WHERE d.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dossier not found' });
    }

    // Verify that school users can only access their own dossiers
    if (req.user.role === 'school' && result.rows[0].school_id !== req.user.school_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const dossier = {
      ...result.rows[0],
      progress: result.rows[0].total_steps > 0 ? Math.round((result.rows[0].completed_steps / result.rows[0].total_steps) * 100) : 0
    };
    
    res.json(dossier);
  } catch (error) {
    console.error('Error fetching dossier:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createDossier = async (req, res) => {
  const { student_id, license_type } = req.body;

  try {
    // Get student information
    const studentResult = await pool.query('SELECT * FROM students WHERE id = $1', [student_id]);
    const student = studentResult.rows[0];

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Verify that school users can only create dossiers for their students
    if (req.user.role === 'school' && student.school_id !== req.user.school_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      'INSERT INTO dossiers (student_id, student_name, school_id, license_type) VALUES ($1, $2, $3, $4) RETURNING *',
      [student_id, `${student.first_name} ${student.last_name}`, student.school_id, license_type]
    );

    const newDossier = result.rows[0];

    // Create default steps for this dossier
    const steps = [
      'registration',
      'payment',
      'medical_check',
      'theory_course',
      'theory_exam',
      'practice_course',
      'practice_exam',
      'license_issued'
    ];

    for (const step of steps) {
      await pool.query(
        'INSERT INTO dossier_steps (dossier_id, step_name) VALUES ($1, $2)',
        [newDossier.id, step]
      );
    }

    res.status(201).json(newDossier);
  } catch (error) {
    console.error('Error creating dossier:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateDossierStep = async (req, res) => {
  const { id } = req.params;
  const { step, completed, date, result: stepResult } = req.body;

  try {
    // Verify that school users can only update their own dossiers
    if (req.user.role === 'school') {
      const dossierCheck = await pool.query(
        'SELECT * FROM dossiers WHERE id = $1 AND school_id = $2', 
        [id, req.user.school_id]
      );
      
      if (dossierCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    await pool.query(
      'UPDATE dossier_steps SET completed = $1, completion_date = $2, result = $3 WHERE dossier_id = $4 AND step_name = $5',
      [completed, date, stepResult, id, step]
    );

    // Recalculate progress
    const progressResult = await pool.query(
      `SELECT 
        COUNT(*) as total_steps,
        SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed_steps
      FROM dossier_steps 
      WHERE dossier_id = $1`,
      [id]
    );

    const { total_steps, completed_steps } = progressResult.rows[0];
    const progress = total_steps > 0 ? Math.round((completed_steps / total_steps) * 100) : 0;

    // Update dossier progress
    await pool.query(
      'UPDATE dossiers SET progress = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [progress, id]
    );

    res.json({ progress });
  } catch (error) {
    console.error('Error updating dossier step:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
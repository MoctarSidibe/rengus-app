import { pool } from '../utils/database.js';

export const getAllExamCenters = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM exam_centers ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching exam centers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getExamCenterById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('SELECT * FROM exam_centers WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exam center not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching exam center:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createExamCenter = async (req, res) => {
  const { name, address, contact_person, phone, email } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO exam_centers (name, address, contact_person, phone, email) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, address, contact_person, phone, email]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating exam center:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateExamCenter = async (req, res) => {
  const { id } = req.params;
  const { name, address, contact_person, phone, email } = req.body;

  try {
    const result = await pool.query(
      'UPDATE exam_centers SET name = $1, address = $2, contact_person = $3, phone = $4, email = $5 WHERE id = $6 RETURNING *',
      [name, address, contact_person, phone, email, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exam center not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating exam center:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteExamCenter = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM exam_centers WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exam center not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting exam center:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
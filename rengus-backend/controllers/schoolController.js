import { pool } from '../utils/database.js';

export const getAllSchools = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM schools ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSchoolById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('SELECT * FROM schools WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching school:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createSchool = async (req, res) => {
  const { name, address, phone, email, director_name } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO schools (name, address, phone, email, director_name) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, address, phone, email, director_name]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating school:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSchool = async (req, res) => {
  const { id } = req.params;
  const { name, address, phone, email, director_name } = req.body;

  try {
    const result = await pool.query(
      'UPDATE schools SET name = $1, address = $2, phone = $3, email = $4, director_name = $5 WHERE id = $6 RETURNING *',
      [name, address, phone, email, director_name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating school:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteSchool = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM schools WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting school:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
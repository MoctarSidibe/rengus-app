import { pool } from '../utils/database.js';

export const getAllStudents = async (req, res) => {
  try {
    let query = `
      SELECT s.*, sc.name as school_name 
      FROM students s 
      LEFT JOIN schools sc ON s.school_id = sc.id
    `;
    let params = [];

    if (req.user.role === 'school') {
      query += ' WHERE s.school_id = $1';
      params.push(req.user.school_id);
    }

    query += ' ORDER BY s.last_name, s.first_name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students. Please try again.' });
  }
};

export const getStudentsBySchool = async (req, res) => {
  const { schoolId } = req.params;

  try {
    if (req.user.role === 'school' && req.user.school_id != schoolId) {
      return res.status(403).json({ error: 'Access denied. You can only view students from your own school.' });
    }

    const result = await pool.query(
      `SELECT s.*, sc.name as school_name 
       FROM students s 
       LEFT JOIN schools sc ON s.school_id = sc.id
       WHERE s.school_id = $1
       ORDER BY s.last_name, s.first_name`,
      [schoolId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching students by school:', error);
    res.status(500).json({ error: 'Failed to fetch students. Please try again.' });
  }
};

export const getStudentById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT s.*, sc.name as school_name 
       FROM students s 
       LEFT JOIN schools sc ON s.school_id = sc.id
       WHERE s.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (req.user.role === 'school' && result.rows[0].school_id !== req.user.school_id) {
      return res.status(403).json({ error: 'Access denied. You can only view students from your own school.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Failed to fetch student. Please try again.' });
  }
};

export const createStudent = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    date_of_birth,
    birth_country,
    address,
    school_id,
    status,
    nip,
    cnss_number,
    cnamgs_number,
    picture,
    nfc_uid,
    qr_code
  } = req.body;

  try {
    // Validate required fields
    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    let actualSchoolId = req.user.school_id;
    
    if (req.user.role === 'admin' && school_id) {
      actualSchoolId = school_id;
    }

    const result = await pool.query(
      `INSERT INTO students 
      (first_name, last_name, email, phone, date_of_birth, birth_country, address, school_id, status, nip, cnss_number, cnamgs_number, picture, nfc_uid, qr_code) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
      RETURNING *`,
      [
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        birth_country,
        address,
        actualSchoolId,
        status || 'active',
        nip,
        cnss_number,
        cnamgs_number,
        picture,
        nfc_uid,
        qr_code
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating student:', error);
    
    // Handle specific database errors
    if (error.code === '23502') { // not-null violation
      const column = error.column;
      res.status(400).json({ error: `Required field is missing: ${column}` });
    } else if (error.code === '23505') { // unique constraint violation
      res.status(400).json({ error: 'A student with this email or identifier already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create student. Please try again.' });
    }
  }
};

export const updateStudent = async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  try {
    if (req.user.role === 'school') {
      const studentCheck = await pool.query(
        'SELECT * FROM students WHERE id = $1 AND school_id = $2', 
        [id, req.user.school_id]
      );
      
      if (studentCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied. You can only update students from your own school.' });
      }
    }

    // Build dynamic update query based on provided fields
    const setClauses = [];
    const values = [];
    let paramCount = 1;

    // List of allowed fields that can be updated
    const allowedFields = [
      'first_name', 'last_name', 'email', 'phone', 'date_of_birth',
      'birth_country', 'address', 'status', 'nip', 'cnss_number',
      'cnamgs_number', 'picture', 'nfc_uid', 'qr_code'
    ];

    // Add each provided field to the update query
    for (const [key, value] of Object.entries(updateFields)) {
      if (allowedFields.includes(key)) {
        // Validate required fields if they're being updated
        if ((key === 'first_name' || key === 'last_name') && !value) {
          return res.status(400).json({ error: `${key.replace('_', ' ')} is required` });
        }
        
        setClauses.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    // If no valid fields to update, return error
    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    // Add updated_at timestamp
    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    
    // Add the ID parameter
    values.push(id);

    const query = `
      UPDATE students 
      SET ${setClauses.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating student:', error);
    
    // Handle specific database errors
    if (error.code === '23502') { // not-null violation
      const column = error.column;
      res.status(400).json({ error: `Required field is missing: ${column}` });
    } else if (error.code === '23505') { // unique constraint violation
      res.status(400).json({ error: 'A student with this email or identifier already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update student. Please try again.' });
    }
  }
};

export const deleteStudent = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user.role === 'school') {
      const studentCheck = await pool.query(
        'SELECT * FROM students WHERE id = $1 AND school_id = $2', 
        [id, req.user.school_id]
      );
      
      if (studentCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied. You can only delete students from your own school.' });
      }
    }

    const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting student:', error);
    
    // Handle foreign key constraint violation
    if (error.code === '23503') {
      res.status(400).json({ error: 'Cannot delete student. This student has related records in other tables.' });
    } else {
      res.status(500).json({ error: 'Failed to delete student. Please try again.' });
    }
  }
};
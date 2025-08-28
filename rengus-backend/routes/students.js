import express from 'express';
import { 
  getAllStudents, 
  getStudentById, 
  getStudentsBySchool, 
  createStudent, 
  updateStudent, 
  deleteStudent 
} from '../controllers/studentController.js';
import { authenticateToken, requireAdminOrSchool } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdminOrSchool);

router.get('/', getAllStudents);
router.get('/school/:schoolId', getStudentsBySchool);
router.get('/:id', getStudentById);
router.post('/', createStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);



export default router;
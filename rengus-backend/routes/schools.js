import express from 'express';
import { 
  getAllSchools, 
  getSchoolById, 
  createSchool, 
  updateSchool, 
  deleteSchool 
} from '../controllers/schoolController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', getAllSchools);
router.get('/:id', getSchoolById);
router.post('/', createSchool);
router.put('/:id', updateSchool);
router.delete('/:id', deleteSchool);

export default router;
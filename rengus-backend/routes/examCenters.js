import express from 'express';
import { 
  getAllExamCenters, 
  getExamCenterById, 
  createExamCenter, 
  updateExamCenter, 
  deleteExamCenter 
} from '../controllers/examCenterController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', getAllExamCenters);
router.get('/:id', getExamCenterById);
router.post('/', createExamCenter);
router.put('/:id', updateExamCenter);
router.delete('/:id', deleteExamCenter);

export default router;
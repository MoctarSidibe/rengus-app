import express from 'express';
import { 
  getAllDossiers, 
  getDossierById, 
  getDossiersBySchool, 
  createDossier, 
  updateDossierStep 
} from '../controllers/dossierController.js';
import { authenticateToken, requireAdminOrSchool } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllDossiers);
router.get('/school/:schoolId', getDossiersBySchool);
router.get('/:id', getDossierById);
router.post('/', createDossier);
router.patch('/:id/step', updateDossierStep);

export default router;
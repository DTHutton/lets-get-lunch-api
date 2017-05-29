import * as express from 'express';
import RecommendationsCtrl from '../../controllers/recommendations';
import auth from '../../middleware/auth';

const router = express.Router();

router.route('/:id')
  .get(auth.isAuthenticated, RecommendationsCtrl.get);

export default router;
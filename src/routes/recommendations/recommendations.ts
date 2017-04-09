import * as express from 'express';
import RecommendationsCtrl from '../../controllers/recommendations';

const router = express.Router();

router.route('/:id')
  .get(RecommendationsCtrl.get);

export default router;
import * as express from 'express';
import CommentsCtrl from '../../controllers/comments';
import auth from '../../middleware/auth';

const router = express.Router();

router.route('/')
  .post(auth.isAuthenticated, CommentsCtrl.create);

router.route('/event/:id')
  .get(CommentsCtrl.get);


export default router;
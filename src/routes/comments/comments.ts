import * as express from 'express';
import CommentsCtrl from '../../controllers/comments';

const router = express.Router();

router.route('/')
  .post(CommentsCtrl.create);

router.route('/event/:id')
  .get(CommentsCtrl.get);


export default router;
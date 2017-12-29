import * as express from 'express';
import Users from './users';
import Sessions from './sessions';
import Events from './events';
import Comments from './comments';
import Recommendations from './recommendations';
import Test from './test';

const router = express.Router();

router.route('/')
  .get((req: express.Request, res: express.Response) => {
    res.send('Congratulations! Your local API is working!');
  });

router.use('/users', Users);
router.use('/sessions', Sessions);
router.use('/events', Events);
router.use('/comments', Comments);
router.use('/recommendations', Recommendations);

if (process.env.NODE_ENV === 'test') {
  router.use('/test', Test);
}

export default router;

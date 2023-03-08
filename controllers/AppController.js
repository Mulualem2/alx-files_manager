import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus(res) {
    return res
      .send({
        redis: redisClient.isAlive(),
        db: dbClient.isAlive(),
      })
      .status(200);
  }

  static async getStats(res) {
    const stats = {
      users: await dbClient.nbUsers(),
      files: await dbClient.nbFiles(),
    };
    return res.send(stats).status(200);
  }
}

export default AppController;

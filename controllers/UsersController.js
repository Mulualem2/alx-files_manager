import sha1 from 'sha1';
import Queue from 'bull';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const { ObjectId } = require('mongodb');

const userQueue = new Queue('userQ');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).send({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).send({ error: 'Missing password' });
    }

    const isEmailExists = await dbClient.users.findOne({ email });

    if (isEmailExists) {
      return res.status(400).send({ error: 'Already exist' });
    }

    const encPassword = sha1(password);

    const insertUser = await dbClient.users.insertOne({
      password: encPassword,
      email,
    });

    await userQueue.add({
      userId: insertStat.insertedId.toString(),
    });

    return res.status(201).send({ email, id: insertUser.insertedId });
  }

  static async getMe(req, res) {
    const { userId } = req;

    const token = req.header('X-Token') || null;
    if (!token) return res.status(401).send({ error: 'Unauthorized' });

    const redisToken = await redisClient.get(`auth_${token}`);
    if (!redisToken) return res.status(401).send({ error: 'Unauthorized' });

    const user = await dbClient.users.findOne({ _id: ObjectId(redisToken) });
    if (!user) return res.status(401).send({ error: 'Unauthorized' });

    const userInfo = { id: user._id, ...user };
    delete userInfo._id;
    delete userInfo.password;

    return res.status(200).send(userInfo);
  }
}

export default UsersController;

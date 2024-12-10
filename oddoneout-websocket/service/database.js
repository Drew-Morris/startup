const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.username}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('oddoneout');
const userCollection = db.collection('user');
const statsCollection = db.collection('stats');

class Stats {
  constructor() {
    this.accuracy = new AccuracyStat();
    this.precision = new PrecisionStat();
  };
};

class AccuracyStat {
  constructor() {
    this.coarse = {
      wins: 0,
      losses: 0,
    };
    this.fine = {
      botsRescued: 0,
      captchasFailed: 0,
      connectionsLost: 0,
    };
  };
};

class PrecisionStat {
  constructor() {
    this.coarse = {
      humans: 0,
      bots: 0,
    };
    this.fine = {
      truePositives: 0,
      falsePositives: 0,
      trueNegatives: 0,
      falseNegatives: 0,
    };
  };
};

// This will asynchronously test the connection and exit the process if it fails
(async function testConnection() {
  await client.connect();
  await db.command({ ping: 1 });
})().catch((ex) => {
  console.log(`Unable to connect to database with ${url} because ${ex.message}`);
  process.exit(1);
});

function getUser(email) {
  return userCollection.findOne({ email: email });
};

function getUserById(id) {
  return userCollection.findOne({ id: id });
};

function getUserByToken(token) {
  return userCollection.findOne({ token: token });
};

async function createUser(email, password) {
  // Hash the password before we insert it into the database
  const passwordHash = await bcrypt.hash(password, 10);
  let id = uuid.v4();
  while (await getUserById(id)) {
    id = uuid.v4();
  }
  const user = {
    email: email,
    password: passwordHash,
    id: id,
    token: uuid.v4(),
  };
  await userCollection.insertOne(user);

  const stats = {
    id: id, 
    stats: new Stats(),
  };
  await statsCollection.insertOne(stats);

  return user;
};

async function updateUser(id, user) {
  return userCollection.replaceOne(
    {
      id: id
    },
    user
  );
};

async function updateStats(id, stats) {
  return statsCollection.replaceOne(
    { 
      id: id 
    }, 
    {
      id: id,
      stats: stats,
    }
  );
};

function getStats(id) {
  return statsCollection.findOne({ id: id });
};

module.exports = {
  getUser,
  getUserByToken,
  getUserById,
  createUser,
  updateUser,
  updateStats,
  getStats,
  Stats,
};

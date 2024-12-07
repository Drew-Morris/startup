import { Stats } from '../src/stats';

const express = require('express');
const uuid = require('uuid');
const app = express();

// The scores and users are saved in memory and disappear whenever the service is restarted.
let users = {};
let stats = new Stats();

// The service port. In production the front-end code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Serve up the front-end static content hosting
app.use(express.static('public'));

// Router for service endpoints
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

// CreateAuth a new user
apiRouter.post(
  '/auth/register', 
  async (req, res) => {
    const user = users[req.body.email];
    if (user) {
      res.status(409).send({ msg: 'Existing user' });
    } 
    else {
      const user = { 
        email: req.body.email, 
        password: req.body.password, 
        token: uuid.v4() 
      };
      users[user.email] = user;
      res.send({ 
        token: user.token 
      });
    }
  }
);

// GetAuth login an existing user
apiRouter.post(
  '/auth/login', 
  async (req, res) => {
    const user = users[req.body.email];
    if (user && req.body.password === user.password) {
      user.token = uuid.v4();
      res.send({ 
        token: user.token 
      });
      return;
    }
    res.status(401).send({ msg: 'Unauthorized' });
  }
);

// DeleteAuth logout a user
apiRouter.delete(
  '/auth/logout', 
  (req, res) => {
    const user = Object.values(users).find((u) => u.token === req.body.token);
    if (user) {
      delete user.token;
    }
    res.status(204).end();
  }
);

// GetScores
apiRouter.get(
  '/stats/read', 
  (_req, res) => {
    res.send(stats);
  }
);

// SubmitScore - Accuracy
apiRouter.post(
  '/stats/write/accuracy', 
  (req, res) => {
    stats = updateAccuracy(req.body, stats);
    res.send(scores);
  }
);

// SubmitScore - Precision
apiRouter.post(
  '/stats/write/precision', 
  (req, res) => {
    stats = updatePrecision(req.body, stats);
    res.send(stats);
  }
);


// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile(
    'index.html', 
    { 
      root: 'public' 
    }
  );
});

app.listen(
  port, 
  () => {
    console.log(`Listening on port ${port}`);
  }
);

// updateScores considers a new score for inclusion in the high scores.
function updateAccuracy(newStat, stats) {
  if (newStat.wins == 1) {
    stats.accuracy.coarse.wins += 1;
  }
  else {
    stats.accuracy.coarse.losses += 1;
    stats.accuracy.fine.botsRescued += newStat.botsRescued;
    stats.accuracy.fine.captchasFailed += newStat.captchasFailed;
    stats.accuracy.fine.connectionsLost += newStat.connectionsLost;
  }
};

// updateScores considers a new score for inclusion in the high scores.
function updatePrecision(newStat, stats) {
  stats.precision.coarse.humans += newStat.trueNegatives + newStat.falsePositives;
  stats.precision.coarse.bots += newStat.truePositives + newStat.falseNegatives;
  stats.precision.fine.truePositives += newStat.truePositives;
  stats.precision.fine.falsePositives += newStat.falsePositives;
  stats.precision.fine.trueNegatives += newStat.trueNegatives;
  stats.precision.fine.falseNegatives += newStats.falseNegatives;
  return stats;
};

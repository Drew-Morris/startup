const dbConfig = require('./dbConfig.json');
const openAIConfig = require('./openAIConfig.json');

const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const express = require('express');
const uuid = require('uuid');
const app = express();
const DB = require('./database.js');
const openai = require('openai');
const { peerProxy } = require('./peerProxy.js');

const authCookieName = 'token';

// The service port. In production the front-end code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Serve up the front-end static content hosting
app.use(express.static('public'));

// Trust headers that are forwarded from the proxy so we can determine IP addresses
app.set('trust proxy', true);

// Router for service endpoints
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

const bot = new openai.OpenAI({
  apiKey: openAIConfig.apiKey,
});

async function generateText(question) {
  try {
    const botAnswer = await bot.chat.completions.create({
      model: 'gpt-4o-mini', // or any other suitable model
      messages: [
        {
          role: 'system',
          content: 'You are playing a game where you have to convince a group of humans that you are human. Respond to questions using 5 words or less, using only one sentence, and mirror the tone of the question.',
        },
        {
          role: 'user',
          content: question,
        }
      ],
    }).then(
      (response) => response.choices[0].message.content
    );
    return botAnswer;
  } catch (error) {
    console.error('Error:', error);
  }
}

// The scores and users are saved in memory and disappear whenever the service is restarted.
let user = null;
let stats = new DB.Stats();
let answer = null;

// CreateAuth a new user
apiRouter.post(
  '/auth/register', 
  async (req, res) => {
    if (await DB.getUser(req.body.email)) {
      res.status(409).send({ msg: 'Existing user' });
    } 
    else {
      user = await DB.createUser(req.body.email, req.body.password);

      // Set the cookie
      setAuthCookie(res, user.token);

      res.send({ 
        token: user.token,
        id: user.id,
      });
    }
  }
);

// GetAuth login an existing user
apiRouter.post(
  '/auth/login', 
  async (req, res) => {
    user = await DB.getUser(req.body.email);
    if (
      user && await bcrypt.compare(
        req.body.password, 
        user.password
      ).then(
        (result) => result == true
      )
    ) {
      user.token = uuid.v4();
      setAuthCookie(res, user.token);
      DB.updateUser(user.id, user);
      res.send({ 
        token: user.token,
        id: user.id,
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
    if (user) {
      res.clearCookie(authCookieName);
      delete user.token;
      user.token = null;
      DB.updateUser(user.id, user);
      user = null;
    }
    res.status(204).end();
  }
);

// secureApiRouter verifies credentials for endpoints
const secureApiRouter = express.Router();
apiRouter.use(secureApiRouter);

// Get Stats
apiRouter.get(
  '/stats/read', 
  async (_req, res) => {
    if (!user) {
      res.status(401).send({ msg: 'Unauthorized' });
      return;
    }
    const existingStats = await DB.getStats(user.id);
    if (existingStats) {
      stats = existingStats.stats;
      res.send(stats);
      return;
    }
    res.status(500).send({ msg: 'Stats not found' });
  }
);

// SubmitScore - Accuracy
apiRouter.post(
  '/stats/write/accuracy', 
  (req, res) => {
    if (!user) {
      res.status(401).send({ msg: 'Unauthorized' });
      return;
    }
    stats = updateAccuracy(req.body, stats);
    DB.updateStats(user.id, stats);
    res.send(stats);
  }
);

// SubmitScore - Precision
apiRouter.post(
  '/stats/write/precision', 
  (req, res) => {
    if (!user) {
      res.status(401).send({ msg: 'Unauthorized' });
      return;
    }
    stats = updatePrecision(req.body, stats);
    DB.updateStats(stats);
    res.send(stats);
  }
);

// Submit question to bot
apiRouter.post(
  '/bot/question',
  async (req, res) => {
    answer = await generateText(req.body.question);
    return;
  }
);

// Receive answer from bot
apiRouter.get(
  '/bot/answer',
  (req, res) => {
    if (answer) {
      res.send({
        answer: answer,
      });
      return;
    }
    res.status(102).end();
  }
);

// Default error handler
app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile(
    'index.html', 
    { 
      root: 'public' 
    }
  );
});

// setAuthCookie in the HTTP response
function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

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
  return stats;
};

// updateScores considers a new score for inclusion in the high scores.
function updatePrecision(newStat, stats) {
  stats.precision.coarse.humans += newStat.trueNegatives + newStat.falsePositives;
  stats.precision.coarse.bots += newStat.truePositives + newStat.falseNegatives;
  stats.precision.fine.truePositives += newStat.truePositives;
  stats.precision.fine.falsePositives += newStat.falsePositives;
  stats.precision.fine.trueNegatives += newStat.trueNegatives;
  stats.precision.fine.falseNegatives += newStat.falseNegatives;
  return stats;
};

const httpService = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

peerProxy(httpService);

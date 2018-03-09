'use strict';
var express = require('express');
var router = express.Router();
const client = require('../db')

module.exports = function makeRouterWithSockets(io) {
  const baseQ = 'SELECT * FROM tweets INNER JOIN users ON users.id = tweets.user_id\n'
  // a reusable function
  function respondWithAllTweets(req, res, next) {
    client.query(baseQ, (err, results) => {
      if (err) next(err);

      let allTheTweets = results.rows

      res.render('index', {
        title: 'Twitter.js',
        tweets: allTheTweets,
        showForm: true
      });
    })
  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function (req, res, next) {
    client.query(baseQ + 'WHERE users.name = $1', [req.params.username], (err, results) => {
      if (err) next(err)

      let tweetsForName = results.rows;
      console.log(tweetsForName)
      res.render('index', {
        title: 'Twitter.js',
        tweets: tweetsForName,
        showForm: true,
        username: req.params.username
      });
    })
  });

  // single-tweet page
  router.get('/tweets/:id', function (req, res, next) {
    client.query(baseQ + 'WHERE tweets.id = $1', [req.params.id], (err, results) => {
      if (err) next(err);

      res.render('index', {
        title: 'Twitter.js',
        tweets: results.rows // an array of only one element ;-)
      });

    })
  });

  // create a new tweet
  router.post('/tweets', function (req, res, next) {
    client.query('SELECT * FROM users WHERE users.name = $1', [req.body.name], (err, results) => {
      if (err) next(err)

      if (!results.rows.length) {
        client.query('INSERT INTO users (name) VALUES ($1) RETURNING id', [req.body.name], (err, results) => {
          client.query('INSERT INTO tweets (user_id, content) VALUES ($1 $2)', [results.rows[0].id, req.body.content], (err, results) => {
            if (err) return next(err);
            let newTweet = results;
            console.log(newTweet)
            io.sockets.emit('new_tweet', newTweet);
            res.redirect('/');
          })

        })
      }
    })
  });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}

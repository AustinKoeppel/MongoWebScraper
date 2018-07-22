var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
const fs = require("fs");
console.log(process.env.MONGODB_URI)
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT =  process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect(MONGODB_URI);

// Routes
app.get("/saved",(req,res)=>{
  fs.readFile(__dirname + '/public/saved-articles.html', 'utf8', function(err, text){
    res.send(text);
  });
})

app.get("/saved-articles",(req,res)=>{
  // Grab every document in the Articles collection
  db.Article.find({saved: true}).sort({_id: -1}).limit(20)
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
})

// A GET route for scraping the slashdot website
app.get("/scrape", function(req, res) {
  axios.get("https://developers.slashdot.org/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    const $ = cheerio.load(response.data);
    let bodies = [];
    $("article.fhitem").each((i, element) => {
      bodies.push(($(element).children("div.body").text().trim().slice(0,300) + "..."));
    })
    $("h2.story").each(function(i, element) {
      // Save an empty result object
      let result = {};

      let link;
      $(element).children("span.story-title").each((i, element) => {
        link = $(element).children("a")[0];
        link = "https:"+$(link).attr("href");
      })
      
      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(element).children("span.story-title").text();

      result.link = link;
      result.body = bodies[i];
      result.saved = false;

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
      });
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete");
  });
});

app.get("/save-article/:id", function(req, res) {
  db.Article.update({ _id: req.params.id }, { $set: { saved: true }},(res,err) => {
    if(err) {
      console.log(err);
    }
  });
  res.send(200);
});

app.get("/unsave-article/:id", function(req, res) {
  db.Article.update({ _id: req.params.id }, { $set: { saved: false }},(res,err) => {
    if(err) {
      console.log(err);
    }
  });
  res.send(200);
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({}).sort({_id: -1}).limit(20)
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  console.log("WE HIT THIS")
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});

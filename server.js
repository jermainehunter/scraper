const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const exphbs = require("express-handlebars");
// Require all models
const db = require("./models");

const PORT = process.env.PORT || 3000;

// Initialize Express
const app = express();


app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");



// // Use morgan logger for logging requests
// app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/bbcScraper", { useNewUrlParser: true, useCreateIndex: true });
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/bbcScraper";

mongoose
    .connect(MONGODB_URI, { useNewUrlParser: true }, (err) => {
        if(err) throw err;
        console.log("Database Connected!");
    });

// Routes
app.get("/", function (req, res) {
    db.Article.find({})
    .populate("comments")
        .then(dbArticle => {
            res.render("index", { articles: dbArticle });
        })

});

// Route for saved articles
app.get("/saved", function (req, res) {
    db.Article.find({saved:true})
    .populate("comments")
        .then(dbArticle => {
            res.render("index", { articles: dbArticle });
        })

});


// A GET route for scraping the echoJS website
app.get("/scrape", (req, res) => {
    // First, we grab the body of the html with axios
    axios.get("https://www.bbc.com/sport").then(response => {
        const $ = cheerio.load(response.data);
        $(".gs-c-promo-heading").each(function () {
            // Save an empty result object
            const result = {};
            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children("h3")
                .text();
            result.link = $(this)
                .attr("href");
            console.log(result);
            result.saved = false
console.log(result.title)

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(dbArticle => {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(err => {
                    // If an error occurred, log it
                    console.log(err);
                });
        });

        // Send a message to the client
        res.send("Scrape Complete");
    });
});

//post route for comments
app.post("/api/:articleId/comment", (req, res) => {
    db.Comment
        .create({body: req.body.body})
        .then(dbComment => {
            return db.Article.findOneAndUpdate({_id: req.params.articleId}, {$push: { comments: dbComment._id}}, {new: true})
        })
        .then(() => res.redirect("/"))
        // .catch(err => res.json(err));
        .catch(err => {
            // If an error occurred, log it
            console.log(err);
        });
});

// route for saving articles

app.get("/api/save-article/:articleId", (req, res) => {
    db.Article.findOneAndUpdate({_id: req.params.articleId}, { saved: true})
    .then(function(result){
       res.send("worked")
        
    })
    .catch(function(error){
        res.send(error)
    })
})

// route for saving articles

app.get("/api/delete-comment/:commentId", (req, res) => {
    db.Comment.findOneAndRemove({_id: req.params.commentId})
    .then(function(result){
       res.send("worked")
        
    })
    // .catch(function(error){
    //     res.send(error)
    // })
    .catch(err => {
        // If an error occurred, log it
        console.log(err);
    });
});




// Listen on port 3000
app.listen(PORT, () => {
    console.log(`App running on port http://localhost:${PORT}`);
});
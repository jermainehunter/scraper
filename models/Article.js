const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const articleSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true,
        saved: Boolean
    },

    createdDate: {
        type: Date,
        default: Date.now

    },
    saved: {
        type: Boolean,
        default: false
    },

    comments: [
        {
          // Store ObjectIds in the array
          type: Schema.Types.ObjectId,
          // The ObjectIds will refer to the ids in the Note model
          ref: "Comment"
        }
      ],

});

// module.exports = mongoose.model("Article", articleSchema);
const Article = mongoose.model("Article", articleSchema);
module.exports = Article;
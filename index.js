const express = require("express");
const app = express();
const port = 5000;

const mongoose = require("mongoose");
mongoose
  .connect(
    "mongodb+srv://whitetier:rldjrdl2@boiler-plate.eyice.mongodb.net/boiler-plate?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
  )
  .then(() => console.log("mongoDB connected.."))
  .catch((err) => console.log("errored" + err));

app.get("/", (req, res) => res.send("hello"));
app.listen(port, () => console.log(`express on ${port}`));

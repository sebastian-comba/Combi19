//jshint esversion:6

const express = require("express");
const port = process.env.PORT || 3000;
const ejs = require("ejs");

const app = express();

app.set("view engine", "ejs");

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.render("home", {});
});

app.listen(3000, function () {
  console.log("Server started on port " + port);
});

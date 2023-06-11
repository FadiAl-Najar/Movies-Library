"use strict";

const data = require("./MovieData/data.json");
const express = require("express");
require("dotenv").config();
const axios = require("axios");
const cors = require("cors");
const server = express();
const apikey = process.env.APIkey;
const pg = require("pg");
const PORT = 3000;
server.use(express.json());
server.use(cors());

const client = new pg.Client(process.env.URL_DATABASE);
server.get("/", (req, res) => {
  const movie = new Movie(data.title, data.poster_path, data.overview);
  res.send(movie);
});

server.get("/favorite", (req, res) => {
  res.send("Welcome to Favorite Page");
});
server.post("/addMovie", handleAddMovie);
server.get("/getMovies", handleGetMovie);
server.get("/trending", handleTrending);
server.get("/search", searchHandler);
server.put("/update/:id", updateHandler);
server.delete("/delete/:id", deleteHandler);
server.get("/getMovie/:id", getUsingID)

server.get("*", (req, res) => {
  res.status(404).send("Page Not Found");
});

server.get("*", (req, res) => {
  //   console.error(err.stack);
  const serverEror = {
    status: 500,
    responseText: "Sorry, something went wrong",
  };
  res.status(500).send(serverEror);
});

server.use(errorHandler);

function handleAddMovie(req, res) {
  const movie = req.body;
  console.log(movie);
  const sql = `INSERT INTO favMovie (nameMovie) VALUES ($1)`;
  const values = [movie.nameMovie];
  client
    .query(sql, values)
    .then((data) => {
      res.send("Add the name of movie");
    })
    .catch((error) => {
      errorHandler(error, req, res);
    });
}

function handleGetMovie(req, res) {
  const sql = `SELECT * FROM favMovie`;
  client
    .query(sql)
    .then((data) => {
      res.send(data.rows);
    })
    .catch((error) => {
      errorHandler(error, req, res);
    });
}

function handleTrending(req, res) {
  const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${apikey}&language=en-US`;

  try {
    axios
      .get(url)
      .then((result) => {
        let mapRestult = result.data.results.map((item) => {
          const movie = new Movie(
            item.id,
            item.title,
            item.release_date,
            item.poster_path,
            item.overview
          );
          return movie;
        });
        res.send(mapRestult);
      })
      .catch((err) => {
        console.log("The Error is: ", err);
        res.status(500).send(err);
      });
  } catch (error) {
    errorHandler(error, req, res);
  }
}
function searchHandler(req, res) {
  const nameMovie = "The+Whale";
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apikey}&language=en-US&query=${nameMovie}&page=2`;
  try {
    axios
      .get(url)
      .then((response) => {
        let mapResult = response.data.results.map((item) => {
          const movie = new Movie(
            item.id,
            item.title,
            item.release_date,
            item.poster_path,
            item.overview
          );
          return movie;
        });
        res.send(mapResult);
      })
      .catch((error) => {
        console.log("The Error is: ", error);
        res.status(500).send(error);
      });
  } catch (error) {
    errorHandler(error, req, res);
  }
}

function updateHandler(req, res) {
  const { id } = req.params;
  console.log(req.body);
  const sql = `UPDATE favMovie
   SET nameMovie = $1
    WHERE id = ${id}`;
  const { nameMovie } = req.body;
  const values = [nameMovie];
  client
    .query(sql, values)
    .then((data) => {
      res.send(data);
    })
    .catch((error) => {
      errorHandler(error, req, res);
    });
}

function deleteHandler(req, res) {
  const id = req.params.id;
  const sql = `DELETE FROM favMovie WHERE id = ${id}`;
  client
    .query(sql)
    .then((data) => {
      res.send(data);
    })
    .catch((error) => {
      errorHandler(error, req, res);
    });
}
function getUsingID (req, res) {
  const id = req.params.id;
  const sql = `SELECT * FROM favMovie WHERE id = ${id}`
  client.query(sql).then((data)=> {
    res.send(data);
  })
  .catch((error) => {
    errorHandler(error, req, res);
  });
}
function Movie(id, title, release_date, poster_path, overview) {
  this.id = id;
  this.title = title;
  this.release_date = release_date;
  this.poster_path = poster_path;
  this.overview = overview;
}

function errorHandler(error, req, res) {
  const err = {
    status: 500,
    message: error,
  };
  res.status(500).send(err);
}

client.connect().then(() => {
  server.listen(PORT, () => {
    console.log(`I am ready to Listen: ${PORT}`);
  });
});

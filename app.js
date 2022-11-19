const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());
let db = null;
const initializeBDAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, (request, response) => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeBDAndServer();

//API1
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
    movie_name AS movieName
    FROM
    movie
    ORDER BY
    movie_id;`;
  const movieArray = await db.all(getMoviesQuery);
  response.send(movieArray);
});

//API2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { movieId, directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO
    movie (director_id,movie_name,lead_actor)
    VALUES (${directorId},'${movieName}','${leadActor}');`;
  const dbResponse = await db.run(addMovieQuery);
  let movId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//API3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
    movie_id AS movieId,director_id AS directorId,movie_name AS movieName,lead_actor AS leadActor
    FROM
    movie
    WHERE
    movie_id=${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(movie);
});

//API4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE
    movie
    SET
    movie_id=${movieId},
    director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    WHERE
    movie_id=${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
    movie
    WHERE
    movie_id=${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API6
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
    director_id AS directorId,director_name AS directorName
    FROM
    director
    ORDER BY
    director_id;`;
  const directorArray = await db.all(getDirectorsQuery);
  response.send(directorArray);
});

//API7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT
    movie_name AS movieName
    FROM
    movie
    WHERE
    director_id=${directorId};`;
  const directorMoviesArray = await db.all(getDirectorMoviesQuery);
  response.send(directorMoviesArray);
});

module.exports = app;

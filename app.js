const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();

app.use(express.json());

let db = null;
const dbpath = path.join(__dirname, "moviesData.db");
const initial = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("running at http://localhost:3000/");
    });
  } catch (e) {
    console.log("hh");
    process.exit(1);
  }
};
initial();
const movieconvert = (dbobject) => {
  return {
    movieId: dbobject.movie_id,
    directorId: dbobject.director_id,
    movieName: dbobject.movie_name,
    leadActor: dbobject.lead_actor,
  };
};
const dirConvert = (db2) => {
  return {
    directorId: db2.director_id,
    directorName: db2.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const moviesquery = `select movie_name from movie ;`;
  const moviearray = await db.all(moviesquery);
  response.send(moviearray.map((xx) => movieconvert(xx)));
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addquery = `insert into movie(director_id,movie_name,lead_actor) values(${directorId},"${movieName}","${leadActor}");`;
  const movie = await db.run(addquery);
  response.send("Movie Successfully Added");
});
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const query = `select * from movie where movie_id=${movieId};`;
  const movie = await db.get(query);
  response.send(movieconvert(movie));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const upquery = `update movie set director_id=${directorId},
    movie_name="${movieName}",lead_actor="${leadActor}" 
    where movie_id=${movieId};`;
  await db.run(upquery);
  response.send("Movie Details Updated");
});
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const delQuery = `DELETE from movie WHERE movie_id=${movieId};`;
  await db.run(delQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const dirQuery = `select * from director;`;
  const dirArray = await db.all(dirQuery);
  response.send(dirArray.map((eachDir) => dirConvert(eachDir)));
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const query = `select movie_name from movie where director_id="${directorId}" ;`;
  const query1 = await db.all(query);
  response.send(query1.map((each) => ({ movieName: each.movie_name })));
});

module.exports = app;

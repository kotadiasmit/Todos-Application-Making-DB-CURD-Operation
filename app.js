const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http:/localhost:3000");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//Returns a list of all todos whose status is 'TO DO'//
app.get("/todos/", async (request, response) => {
  const allURLQuery = request.query;
  const {
    offset = 0,
    limit = 10,
    order = "ASC",
    order_by = "id",
    search_q = "",
    status,
  } = allURLQuery;
  console.log(allURLQuery);
  const listOfAllTodos = `
    SELECT * 
    FROM todo
    WHERE status='${status}'`;
  const allTodosArray = await db.all(listOfAllTodos);
  response.send(allTodosArray);
});

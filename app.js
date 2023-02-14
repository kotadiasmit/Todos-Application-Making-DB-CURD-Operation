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
    priority,
  } = allURLQuery;
  console.log(allURLQuery);
  console.log(status);
  console.log(priority);
  console.log(search_q);
  let listOfAllTodos = null;
  if (status !== undefined && priority === undefined) {
    listOfAllTodos = `
    SELECT * 
    FROM todo
    WHERE status='${status}'`;
  } else if (priority !== undefined && status === undefined) {
    listOfAllTodos = `
    SELECT * 
    FROM todo
    WHERE priority='${priority}'`;
  } else if (status !== undefined && priority !== undefined) {
    listOfAllTodos = `
    SELECT * 
    FROM todo
    WHERE status='${status}' AND priority='${priority}'`;
  } else {
    listOfAllTodos = `
    SELECT * 
    FROM todo
    WHERE todo LIKE'%${search_q}%'`;
  }
  console.log(listOfAllTodos);
  const allTodosArray = await db.all(listOfAllTodos);
  response.send(allTodosArray);
});

//Return a specific todo based on the todo ID//
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT * FROM todo
    WHERE id=${todoId}`;
  const getTodo = await db.get(getTodoQuery);
  response.send(getTodo);
});

//Update the details of a specific todo based on the todo ID//
app.post("/todos/", async (request, response) => {
  const addTodoRequest = request.body;
  console.log(addTodoRequest);
  const { id, todo, priority, status } = addTodoRequest;
  const addTodoQuery = `
  INSERT INTO todo
  (id, todo, priority, status)
  VALUES
  (${id}, "${todo}", '${priority}', '${status}')`;
  console.log(addTodoQuery);
  const addTodo = await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});
//Update the details of a specific todo based on the todo ID//
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const addTodoRequest = request.body;
  console.log(addTodoRequest);
  const { todo, priority, status } = addTodoRequest;
  let addTodoQuery;
  let responseSendMessage;
  if (status !== undefined) {
    addTodoQuery = `
        UPDATE todo
        SET
        status='${status}'`;
    responseSendMessage = "Status Updated";
  } else if (priority !== undefined) {
    addTodoQuery = `
        UPDATE todo
        SET
        priority='${priority}'`;
    responseSendMessage = "Priority Updated";
  } else {
    addTodoQuery = `
        UPDATE todo
        SET
        todo='${todo}'`;
    responseSendMessage = "Todo Updated";
  }

  console.log(addTodoQuery);
  const addTodo = await db.run(addTodoQuery);
  response.send(responseSendMessage);
});

//Delete a todo from the todo table based on the todo ID//
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM todo
    WHERE id=${todoId}`;
  const deleteTodo = await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;

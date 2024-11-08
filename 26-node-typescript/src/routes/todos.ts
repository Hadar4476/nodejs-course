import { Router } from "express";
import { Todo } from "../models/todo";
import {
  DeleteTodoResponse,
  PostTodoRequestBody,
  PostTodoResponse,
  UpdateTodoRequestBody,
  UpdateTodoResponse,
  UpdateTodoRequestParams,
  DeleteTodoRequestParams,
} from "../types";

const router = Router();

let todos: Todo[] = [];
let counter = 1;

router.get("/", (req, res, next) => {
  res.status(200).json({ todos });
});

router.post("/", (req, res, next) => {
  const body: PostTodoRequestBody = req.body;

  const newTodo: Todo = {
    id: counter,
    text: body.text,
  };

  todos.push(newTodo);

  counter += 1;

  const response: PostTodoResponse = { message: "Created Todo", todos };

  res.status(201).json(response);
});

router.put("/:todoId", (req, res, next) => {
  const params: UpdateTodoRequestParams = req.params;
  const body: UpdateTodoRequestBody = req.body;

  const todoId = +params.todoId;

  const todoIndex = todos.findIndex((todo) => todo.id === todoId);

  if (todoIndex >= 0) {
    todos[todoIndex] = {
      ...todos[todoIndex],
      text: body.text,
    };

    const response: UpdateTodoResponse = {
      message: "Updated Todo",
      todo: todos[todoIndex],
    };

    res.status(200).json(response);
    return;
  }

  res.status(404).json({ message: "Todo not found" });
});

router.delete("/:todoId", (req, res, next) => {
  const params: DeleteTodoRequestParams = req.params;

  const todoId = +params.todoId;

  const filteredTodos = todos.filter((todo) => todo.id !== todoId);

  todos = filteredTodos;

  const response: DeleteTodoResponse = { message: "Deleted Todo", todos };

  res.status(200).json(response);
});

export default router;

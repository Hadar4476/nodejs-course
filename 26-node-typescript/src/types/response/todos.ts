import { Todo } from "../../models/todo";

export interface GetTodosResponse {
  todos: Todo[];
}

export interface PostTodoResponse {
  message: string;
  todos: Todo[];
}

export interface UpdateTodoResponse {
  message: string;
  todo: Todo;
}

export interface DeleteTodoResponse {
  message: string;
  todos: Todo[];
}

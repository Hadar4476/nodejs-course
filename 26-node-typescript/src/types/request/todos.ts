export interface PostTodoRequestBody {
  text: string;
}

export interface UpdateTodoRequestBody {
  text: string;
}

export interface UpdateTodoRequestParams {
  todoId: string;
}

export interface DeleteTodoRequestParams {
  todoId: string;
}

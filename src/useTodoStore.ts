import { usePouch } from "./usePouch"

export interface TodoInput {
  text: string
  createdAt?: number
}

export interface Todo {
  text: string
  header: string
  createdAt: number
  updatedAt: number
}

export interface UpdateTodo extends TodoInput {
  _id: string
}

const makeObject = (input: TodoInput): Omit<Todo, "_id"> => {
  if (!input.text) {
    throw new Error('Invalid Todo')
  }
  return {
    ...input,
    header: input.text.split('\n')[0],
    createdAt: input.createdAt || Date.now(),
    updatedAt: Date.now(),
  }
}

export const useTodoStore = () => {
  const [todos, pouch] = usePouch<Todo>('todos')

  const create = (input: TodoInput) => {
    return pouch.post(makeObject(input))
  }
  const update = (input: UpdateTodo) => {
    return pouch.put(makeObject(input))
  }

  return [todos, {
    create,
    remove: pouch.remove,
    update
  }] as const
}

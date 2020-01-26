import { usePouch, Doc } from "./usePouch"
import { useCallback } from "react"

export interface Todo {
  text: string
  header: string
  createdAt: number
  updatedAt: number
}

export interface CreateTodo {
  text: string
}

export interface UpdateTodo extends Todo {
  _id: string
}

export type TodoDoc= Doc<Todo>

const createTodo = (input: CreateTodo): Todo => {
  return {
    ...input,
    header: input.text.split('\n')[0],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

const updateObject = (input: UpdateTodo): UpdateTodo => {
  return {
    ...input,
    header: input.text.split('\n')[0],
    updatedAt: Date.now(),
  }
}

export const useTodoStore = () => {
  const [todos, { put, post, remove }] = usePouch<Todo>('todos')

  const create = useCallback((input: CreateTodo) => post(createTodo(input)), [post])
  const update = useCallback((input: UpdateTodo) => put(updateObject(input)), [put])

  return [todos, {
    create,
    remove,
    update
  }] as const
}

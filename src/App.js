import React, { useMemo, useState } from 'react'
import { Fade, Button } from '@material-ui/core'
import { usePouch } from './usePouch'
import { TodoInput } from './TodoInput'
import './App.css'

function App() {
  console.log('render App')
  const [todos, pouch] = usePouch('todos', { rejectErrors: true })
  const [inputText, updateInput] = useState('')
  const todosByDate = useMemo(() => Object.values(todos).reverse(), [todos])
  const submit = () => {
    if (inputText === '') {
      return
    }
    pouch.put({ text: inputText })
    updateInput('')
  }
  return (
    <div className="App">
      <TodoInput value={inputText} updateValue={updateInput} onSubmit={submit} />
      <div className="TodoList">
        <h2>TODOS</h2>
        {todosByDate.map((todo) => {
          return (
            <Fade in={true} key={todo._id}>
              <div>
                <code>{todo.text}</code>
                <Button onClick={() => pouch.remove(todo)}>delete</Button>
              </div>
            </Fade>
          )
        })}
      </div>
    </div>
  );
}

export default App;

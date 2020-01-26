import React, { useMemo, useState, useCallback } from 'react'
import { DeleteForever } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles'
import { Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core'
import { TodoInput } from './TodoInput'
import { useTodoStore, TodoDoc } from './useTodoStore'
import { useEscape } from './useEscape'

const useStyles = makeStyles(theme => ({
  root: {
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    overflowX: 'auto',
  },
  table: {

  },
  input: {
    width: '100%'
  }
}))

const viewModel = (todo: TodoDoc) => ({
  ...todo,
  createdAtDisplay: new Date(todo.createdAt).toLocaleDateString()
})

function App() {
  const [todos, { create, remove, update }] = useTodoStore()
  const [inputText, updateInput] = useState('')
  const [selectedTodo, setSelectedTodo] = useState<null|string>(null)

  const todosArray = useMemo(() => Object.values(todos).map(viewModel), [todos])
  const sortedTodos = useMemo(()=> [...todosArray].sort(({createdAt}) => createdAt), [todosArray])

  const todosToRender = useMemo(() => {
    if (selectedTodo) {
      return sortedTodos
    }
    return sortedTodos.filter(({text}) => text.match(inputText))
  }, [sortedTodos, inputText, selectedTodo])

  const submit = () => {
    if (inputText.replace(/\n/g, '') === '') {
      return
    }
    if (selectedTodo) {
      update({ ...todos[selectedTodo], text: inputText })
      clearSelectedTodo()
      return
    }

    create({ text: inputText })
    updateInput('')
  }

  const selectTodo = (id: string) => {
    setSelectedTodo(id)
    updateInput(todos[id].text)
  }

  const clearSelectedTodo = useCallback(() => {
    if (!selectedTodo) {
      return
    }
    setSelectedTodo(null)
    updateInput('')
  }, [selectedTodo])

  useEscape(clearSelectedTodo)

  const classes = useStyles()
  return (
    <Paper className={classes.root}>
      <TodoInput value={inputText} updateValue={updateInput} onSubmit={submit} className={classes.input} />
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>Note</TableCell>
            <TableCell align="right">Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {todosToRender.map(({ _id, _rev, text, createdAtDisplay }) => (
            <TableRow key={_id} selected={_id === selectedTodo }>
              <TableCell><DeleteForever onClick={() => remove({ _id, _rev })}/></TableCell>
              <TableCell component="th" scope="row" align="center" onClick={() => selectTodo(_id)}>
                {text}
              </TableCell>
              <TableCell align="right">{createdAtDisplay}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div style={{ maxWidth: "100%" }}>
      </div>
    </Paper>
  )
}

export default App

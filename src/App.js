import React, { useMemo, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { TodoInput } from './TodoInput'
import { DeleteForever } from '@material-ui/icons'
import { Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';
import { useTodoStore } from './useTodoStore';

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

function App() {
  console.log('render App')
  const [todos, { create }] = useTodoStore('todos', { rejectErrors: false })
  const [inputText, updateInput] = useState('')

  const todosArray = useMemo(() => {
    return Object.values(todos).map(todo => {
      return {
        ...todo,
        createdAtDisplay: new Date(todo.createdAt).toLocaleDateString()
      }
    }).reverse()
  }, [todos])
  const todosByDate = useMemo(() => [...todosArray].sort(i => i.createdAt), [todosArray])
  const filteredTodos = useMemo(() => todosByDate.filter(todo => todo.text.match(inputText)), [inputText, todosByDate])

  const todosToRender = filteredTodos

  const submit = () => {
    if (inputText.replace(/\n/g, '') === '') {
      return
    }
    create({ text: inputText })
    updateInput('')
  }

  const classes = useStyles()
  return (
    <Paper className={classes.root}>
      <TodoInput value={inputText} updateValue={updateInput} onSubmit={submit} className={classes.input} />
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Note</TableCell>
            <TableCell align="right">Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {todosToRender.map(todo => (
            <TableRow key={todo._id}>
              <TableCell component="th" scope="row" align="center">
                {todo.text}
              </TableCell>
              <TableCell align="right">{todo.createdAtDisplay}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div style={{ maxWidth: "100%" }}>
      </div>
    </Paper>
  );
}

export default App;

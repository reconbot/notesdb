import React, { useState } from 'react'
import { TextField, InputAdornment, IconButton } from '@material-ui/core'
import { AddCircleOutline } from '@material-ui/icons'

export const TodoInput = ({ value, updateValue, onSubmit, className }) => {
  const [multiline, setMultiline] = useState(false)
  const submit = () => {
    setMultiline(false)
    onSubmit()
  }

  const inputChange = event => {
    updateValue(event.target.value)
  }
  const onEnter = event => {
    if (event.key !== 'Enter') {
      return
    }
    const shift = event.getModifierState('Shift')
    if (shift && !multiline) {
      setMultiline(true)
      return
    }
    if (!shift && multiline) {
      return
    }
    event.preventDefault()
    submit()
  }

  const inputProps= {
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          aria-label="save todo"
          onClick={submit}
        >
          <AddCircleOutline />
        </IconButton>
      </InputAdornment>
    )
  }

  return (
    <TextField
      className={className}
      id="outlined-multiline-flexible"
      label="What's on your mind?"
      InputProps={inputProps}
      multiline={true}
      value={value}
      onChange={inputChange}
      margin="normal"
      helperText={multiline ? "shit+enter for save" : "shit+enter for \\n"}
      variant="outlined"
      onKeyPress={onEnter}
    />
  )
}

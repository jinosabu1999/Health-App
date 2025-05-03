"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function TodoList() {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState("")

  useEffect(() => {
    const storedTodos = localStorage.getItem("todos")
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos))
  }, [todos])

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }])
      setNewTodo("")
    }
  }

  const toggleTodo = (id) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">Todo List</h2>
      <div className="flex space-x-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo"
          className="flex-grow p-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === "Enter" && addTodo()}
        />
        <button
          onClick={addTodo}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out"
        >
          Add
        </button>
      </div>
      <AnimatePresence>
        {todos.map((todo) => (
          <motion.div
            key={todo.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-4 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="w-5 h-5 text-blue-600"
              />
              <span className={`${todo.completed ? "line-through text-gray-500" : "text-gray-800 dark:text-white"}`}>
                {todo.text}
              </span>
            </div>
            <button onClick={() => deleteTodo(todo.id)} className="text-red-500 hover:text-red-600">
              Delete
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

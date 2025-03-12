import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [name, setName] = useState('')

  return (
    <div>
      <input type="text" onChange={(e) => {
        setName(e.target.value)
      }} />
      <button onClick={() => console.log(name)
      }>Submit</button>
    </div>
  )
}

export default App

import { Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { SelectChild } from './pages/SelectChild'
import { AddChild } from './pages/AddChild'
import { Context } from './pages/Context'
import { Describe } from './pages/Describe'
import { Clarification } from './pages/Clarification'
import { Response } from './pages/Response'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/select-child" element={<SelectChild />} />
      <Route path="/add-child" element={<AddChild />} />
      <Route path="/context" element={<Context />} />
      <Route path="/describe" element={<Describe />} />
      <Route path="/clarification" element={<Clarification />} />
      <Route path="/response" element={<Response />} />
    </Routes>
  )
}

export default App

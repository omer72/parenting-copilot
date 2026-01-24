import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Landing } from './pages/Landing'
import { Home } from './pages/Home'
import { SelectChild } from './pages/SelectChild'
import { ChildProfile } from './pages/ChildProfile'
import { Context } from './pages/Context'
import { Describe } from './pages/Describe'
import { Clarification } from './pages/Clarification'
import { Response } from './pages/Response'
import { DailyReport } from './pages/DailyReport'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/select-child" element={<SelectChild />} />
        <Route path="/child" element={<ChildProfile />} />
        <Route path="/child/:id" element={<ChildProfile />} />
        <Route path="/context" element={<Context />} />
        <Route path="/describe" element={<Describe />} />
        <Route path="/clarification" element={<Clarification />} />
        <Route path="/response" element={<Response />} />
        <Route path="/daily-report" element={<DailyReport />} />
      </Routes>
    </Layout>
  )
}

export default App

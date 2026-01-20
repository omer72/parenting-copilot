import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Landing } from './pages/Landing'
import { Home } from './pages/Home'
import { SelectChild } from './pages/SelectChild'
import { AddChild } from './pages/AddChild'
import { Context } from './pages/Context'
import { Describe } from './pages/Describe'
import { Clarification } from './pages/Clarification'
import { Response } from './pages/Response'
import { DailyReport } from './pages/DailyReport'

function LandingOrHome() {
  const hasVisited = localStorage.getItem('parenting-copilot-visited') === 'true';
  return hasVisited ? <Navigate to="/home" replace /> : <Landing />;
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingOrHome />} />
        <Route path="/home" element={<Home />} />
        <Route path="/select-child" element={<SelectChild />} />
        <Route path="/add-child" element={<AddChild />} />
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

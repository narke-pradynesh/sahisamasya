import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '../Layout.jsx'
import HomePage from '../pages/Home.jsx'
import ReportIssuePage from '../pages/ReportIssue.jsx'
import AdminDashboardPage from '../pages/AdminDashboard.jsx'
import { User } from './entities/User.js'

function App() {

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/report-issue" element={<ReportIssuePage />} />
          <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

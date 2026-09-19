import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Materials from './pages/Materials'
import MaterialDetail from './pages/MaterialDetail'
import SemanticSearch from './pages/SemanticSearch'
import Matches from './pages/Matches'
import MatchDetail from './pages/MatchDetail'
import Compare from './pages/Compare'
import Approvals from './pages/Approvals'
import ApprovalDetail from './pages/ApprovalDetail'
import Nmc from './pages/Nmc'
import NmcDetail from './pages/NmcDetail'
import Sync from './pages/Sync'
import Audit from './pages/Audit'
import Upload from './pages/Upload'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/materials/:id" element={<MaterialDetail />} />
          <Route path="/search" element={<SemanticSearch />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/matches/:id" element={<MatchDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/approvals/:id" element={<ApprovalDetail />} />
          <Route path="/nmc" element={<Nmc />} />
          <Route path="/nmc/:code" element={<NmcDetail />} />
          <Route path="/sync" element={<Sync />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

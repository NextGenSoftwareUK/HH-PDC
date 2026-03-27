import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Nav } from './components/Nav'
import { BookingPortal } from './pages/BookingPortal'
import { PassportPortal } from './pages/PassportPortal'
import { HotelDashboard } from './pages/HotelDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Navigate to="/playa-map.html" replace />} />
        <Route path="/book/*" element={<BookingPortal />} />
        <Route path="/passport/*" element={<PassportPortal />} />
        <Route path="/hotel/*" element={<HotelDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

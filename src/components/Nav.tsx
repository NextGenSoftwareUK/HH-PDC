import { Link, useLocation } from 'react-router-dom'
import { Leaf } from 'lucide-react'

export function Nav() {
  const { pathname } = useLocation()
  const isHotel = pathname.startsWith('/hotel')
  const isPassport = pathname.startsWith('/passport')

  if (isHotel) {
    return (
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Leaf className="text-jungle-500 w-5 h-5" />
          <span className="font-medium text-jungle-700 text-sm">Pulmón Verde Partners</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <Link to="/hotel" className={`transition-colors ${pathname === '/hotel' ? 'text-jungle-600 font-medium' : 'text-gray-500 hover:text-gray-800'}`}>Overview</Link>
          <Link to="/hotel/leaderboard" className={`transition-colors ${pathname === '/hotel/leaderboard' ? 'text-jungle-600 font-medium' : 'text-gray-500 hover:text-gray-800'}`}>Leaderboard</Link>
          <Link to="/hotel/trees" className={`transition-colors ${pathname === '/hotel/trees' ? 'text-jungle-600 font-medium' : 'text-gray-500 hover:text-gray-800'}`}>My Trees</Link>
          <Link to="/hotel/send" className={`transition-colors ${pathname === '/hotel/send' ? 'text-jungle-600 font-medium' : 'text-gray-500 hover:text-gray-800'}`}>Send a Guest</Link>
          <Link to="/hotel/impact" className={`transition-colors ${pathname === '/hotel/impact' ? 'text-jungle-600 font-medium' : 'text-gray-500 hover:text-gray-800'}`}>Impact</Link>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Grand Hyatt PDC</span>
          <div className="w-7 h-7 rounded-full bg-jungle-100 flex items-center justify-center text-jungle-600 font-medium text-xs">GH</div>
        </div>
      </nav>
    )
  }

  if (isPassport) {
    return (
      <nav className="border-b border-jungle-700 px-6 py-3 flex items-center justify-between sticky top-0 z-50 bg-jungle-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Leaf className="text-jungle-400 w-5 h-5" />
          <span className="font-display italic text-jungle-200 text-base">Pulmón Verde</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <Link to="/passport" className={`transition-colors ${pathname === '/passport' ? 'text-jungle-200' : 'text-jungle-400 hover:text-jungle-200'}`}>Home</Link>
          <Link to="/passport/trees" className={`transition-colors ${pathname === '/passport/trees' ? 'text-jungle-200' : 'text-jungle-400 hover:text-jungle-200'}`}>My Trees</Link>
          <Link to="/passport/nfts" className={`transition-colors ${pathname === '/passport/nfts' ? 'text-jungle-200' : 'text-jungle-400 hover:text-jungle-200'}`}>NFTs</Link>
          <Link to="/passport/story" className={`transition-colors ${pathname === '/passport/story' ? 'text-jungle-200' : 'text-jungle-400 hover:text-jungle-200'}`}>My Story</Link>
          <Link to="/passport/impact" className={`transition-colors ${pathname === '/passport/impact' ? 'text-jungle-200' : 'text-jungle-400 hover:text-jungle-200'}`}>Impact</Link>
        </div>
        <Link to="/book" className="text-xs border border-jungle-500 text-jungle-300 hover:bg-jungle-700 px-3 py-1.5 rounded-lg transition-colors">
          Book Chapter 2
        </Link>
      </nav>
    )
  }

  return (
    <nav className="border-b border-jungle-700/50 px-6 py-4 flex items-center justify-between absolute top-0 left-0 right-0 z-50">
      <div className="flex items-center gap-2">
        <Leaf className="text-jungle-400 w-5 h-5" />
        <span className="font-display italic text-jungle-200 text-lg">Pulmón Verde</span>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <Link to="/hotel" className="text-jungle-400 hover:text-jungle-200 transition-colors">Hotel Partners</Link>
        <Link to="/passport" className="text-jungle-400 hover:text-jungle-200 transition-colors">My Passport</Link>
      </div>
    </nav>
  )
}

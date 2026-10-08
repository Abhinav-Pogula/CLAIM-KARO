import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'

export default function DashboardLayout({ children, title, subtitle, activeView, onNavigate }) {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: '#0B0D11' }}
    >
      <Sidebar activeView={activeView} onNavigate={onNavigate} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title={title} subtitle={subtitle} />
        <main
          className="flex-1 overflow-y-auto"
          style={{ background: '#0B0D11' }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

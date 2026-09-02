const TABS = [
  { id: 'monitor', label: 'Live Monitor' },
  { id: 'risk', label: 'Risk Ranking' },
]

export default function TabBar({ activeTab, onChangeTab, alertActive }) {
  return (
    <div className="flex gap-1 rounded-lg border border-slate-800 bg-slate-950/60 p-1">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className={`relative rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              isActive ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
            {tab.id === 'monitor' && alertActive && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)]" />
            )}
          </button>
        )
      })}
    </div>
  )
}

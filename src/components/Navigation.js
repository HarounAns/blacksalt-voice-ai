'use client'

export default function Navigation({ activeTab, setActiveTab, isMenuOpen, toggleMenu }) {
  const menuItems = [
    { id: 'config', label: 'Configuration' },
    { id: 'calls', label: 'Call Logs' },
    { id: 'faq', label: 'FAQ Management' },
  ];

  return (
    isMenuOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleMenu}>
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-background p-4 shadow-lg" onClick={e => e.stopPropagation()}>
          <div className="flex flex-col gap-4">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); toggleMenu(); }}
                className={`text-left px-4 py-2 rounded-lg ${
                  activeTab === item.id 
                    ? 'bg-foreground text-background' 
                    : 'hover:bg-black/[.08] dark:hover:bg-white/[.145]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  );
} 
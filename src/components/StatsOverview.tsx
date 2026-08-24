interface StatsProps {
  total: number;
  up: number;
  down: number;
  paused: number;
  avgUptime: number;
  isLoading: boolean;
}

export function StatsOverview({ total, up, down, paused, avgUptime, isLoading }: StatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-4">
            <div className="skeleton h-4 w-20 mb-2" />
            <div className="skeleton h-8 w-16" />
          </div>
        ))}
      </div>
    );
  }

  const allOk = down === 0;

  return (
    <div className="mb-6">
      {/* 整体状态横幅 */}
      <div
        className={`card p-4 mb-4 flex items-center gap-3 ${
          allOk 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}
        role="status"
        aria-live="polite"
      >
        <span className={`text-2xl ${allOk ? 'animate-heartbeat' : ''}`} aria-hidden="true">
          {allOk ? '✅' : '⚠️'}
        </span>
        <div>
          <p className={`font-semibold ${allOk ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
            {allOk ? '所有服务运行正常' : `${down} 个服务出现故障`}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            平均可用率 {avgUptime}%
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="总服务数" value={total} icon="📊" />
        <StatCard label="正常运行" value={up} icon="✅" color="text-green-500" />
        <StatCard label="故障中" value={down} icon="⚠️" color="text-red-500" />
        <StatCard label="已暂停" value={paused} icon="⏸️" color="text-yellow-500" />
      </div>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  icon, 
  color = 'text-slate-900 dark:text-white' 
}: { 
  label: string; 
  value: number; 
  icon: string;
  color?: string;
}) {
  return (
    <div className="card p-4" role="group" aria-label={`${label}: ${value}`}>
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-1">
        <span aria-hidden="true">{icon}</span>
        <span>{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`} aria-hidden="true">{value}</p>
    </div>
  );
}

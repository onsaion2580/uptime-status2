import { useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { StatsOverview } from './components/StatsOverview';
import { Toolbar } from './components/Toolbar';
import { MonitorList } from './components/MonitorList';
import { IncidentList } from './components/IncidentList';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useMonitors } from './hooks/useMonitors';
import { useNotification } from './hooks/useNotification';
import { useTheme } from './hooks/useTheme';
import { useAppStore } from './store';
import { getConfig } from './config';

function App() {
  useTheme();
  const config = getConfig();
  const embedMode = useAppStore((s) => s.embedMode);
  const setEmbedMode = useAppStore((s) => s.setEmbedMode);

  // 初始化：设置页面标题、描述、检查嵌入模式
  useEffect(() => {
    document.title = config.siteName;
    // 设置 meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', config.siteDescription);
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('embed') === '1') {
      setEmbedMode(true);
    }
  }, [config.siteName, config.siteDescription, setEmbedMode]);

  const {
    monitors,
    allMonitors,
    isLoading,
    isFetching,
    isError,
    error,
    stats,
    incidents,
    lastUpdated,
    refetch,
  } = useMonitors();

  // 状态变化通知
  useNotification(allMonitors);

  // 检查是否配置了 API Key
  const hasApiKey = config.apiKeys && config.apiKeys.length > 0 &&
    config.apiKeys.some(key => key && key !== 'your-api-key');

  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="card p-8 max-w-md text-center">
          <p className="text-4xl mb-4">⚙️</p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            请配置 API Key
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            请在 <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">src/config/config.ts</code> 中配置 UptimeRobot API Key
          </p>
          <a
            href="https://uptimerobot.com/dashboard#mySettings"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            获取 API Key
          </a>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900" role="alert">
        <div className="card p-8 max-w-md text-center">
          <p className="text-4xl mb-4" aria-hidden="true">😢</p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            加载失败
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-2">
            {error instanceof Error ? error.message : '无法获取监控数据'}
          </p>
          <p className="text-xs text-slate-400 mb-4">
            已自动重试 2 次，请检查网络连接或 API 配置
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`min-h-screen ${embedMode ? 'p-4' : ''}`}>
        <Header />

        <main id="main-content" className={`max-w-6xl mx-auto px-4 ${embedMode ? '' : 'pt-6'} pb-8`} role="main">
          {!embedMode && (
            <>
              <StatsOverview {...stats} isLoading={isLoading} />
              <Toolbar onRefresh={refetch} isLoading={isFetching} lastUpdated={lastUpdated} />
            </>
          )}

          {/* 嵌入模式简易工具栏 */}
          {embedMode && (
            <div className="flex items-center justify-end gap-2 mb-4">
              <span className="text-xs text-slate-400" aria-live="polite">
                {lastUpdated && `更新于 ${new Date(lastUpdated).toLocaleTimeString('zh-CN')}`}
              </span>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700
                           text-slate-500 hover:text-slate-700 dark:hover:text-slate-300
                           transition-colors disabled:opacity-50"
                title="刷新数据"
                aria-label="刷新监控数据"
              >
                <svg className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          )}
          <div className={`grid ${embedMode ? '' : 'lg:grid-cols-3'} gap-6`}>
            <div className={embedMode ? '' : 'lg:col-span-2'}>
              <MonitorList
                monitors={monitors}
                isLoading={isLoading}
              />
            </div>

            {!embedMode && (
              <div>
                <IncidentList incidents={incidents} isLoading={isLoading} />
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;

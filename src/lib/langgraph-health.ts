// Stub — will be rebuilt when LangGraph integration is added
export function useLangGraphHealth() {
  return {
    health: { errors: [] as string[], trainer: false, chat: false },
    isLoading: false,
    checkHealth: (_force?: boolean) => {},
    isHealthy: false,
    status: 'unhealthy' as 'healthy' | 'degraded' | 'unhealthy' | 'disconnected',
  }
}

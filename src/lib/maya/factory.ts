import { IAgent } from './core/types';
import { mayaAgentInstance } from './agents/maya';

/**
 * Registry of available agents.
 */
class AgentFactory {
  private agents: Map<string, IAgent> = new Map();

  constructor() {
    // Register default agents
    this.register('maya', mayaAgentInstance);
  }

  register(id: string, agent: IAgent) {
    this.agents.set(id, agent);
  }

  getAgent(id: string): IAgent | undefined {
    return this.agents.get(id);
  }
}

export const agentFactory = new AgentFactory();

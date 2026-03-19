import { BaseLangGraphAgent } from '../../core/BaseAgent';
import { mayaGraph, MayaStateType } from './graph';
import { CompiledStateGraph } from '@langchain/langgraph';

/**
 * Specialized agent for university counseling (Maya).
 */
export class MayaAgent extends BaseLangGraphAgent<MayaStateType> {
  constructor() {
    super('maya');
  }

  protected compile(): CompiledStateGraph<MayaStateType, any, any, any, any, any> {
    return mayaGraph.compile();
  }
}

// Export a singleton instance
export const mayaAgentInstance = new MayaAgent();

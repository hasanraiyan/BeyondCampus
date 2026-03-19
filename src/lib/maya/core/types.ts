import { BaseMessage } from '@langchain/core/messages';
import { StructuredTool } from '@langchain/core/tools';
import { StateGraph } from '@langchain/langgraph';
import { RunnableConfig } from '@langchain/core/runnables';

/**
 * Common state for all agents. 
 * Can be extended by specific agent types.
 */
export interface AgentState {
  messages: BaseMessage[];
  [key: string]: any;
}

/**
 * Interface definition for an Agent.
 */
export interface IAgent {
  id: string;
  invoke(input: any, config?: RunnableConfig): Promise<any>;
  streamEvents(input: any, config?: RunnableConfig): AsyncGenerator<any>;
}

/**
 * Configuration for an agent instance.
 */
export interface AgentConfig {
  id: string;
  name: string;
  systemPrompt: string | ((state: any) => Promise<string>);
  tools: StructuredTool[];
  modelName?: string;
  temperature?: number;
}

/**
 * Interface for defining a graph structure.
 */
export interface IGraphDefinition<T extends AgentState> {
  build(config: AgentConfig): StateGraph<T>;
}

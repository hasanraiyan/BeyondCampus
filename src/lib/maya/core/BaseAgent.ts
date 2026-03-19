import { IAgent, AgentState } from './types';
import { StateGraph, CompiledStateGraph } from '@langchain/langgraph';
import { RunnableConfig } from '@langchain/core/runnables';

/**
 * Base implementation for an agent using LangGraph.
 */
export abstract class BaseLangGraphAgent<T extends AgentState> implements IAgent {
  protected graph: CompiledStateGraph<T, any, any, any, any, any>;

  constructor(public id: string) {
    this.graph = this.compile();
  }

  /**
   * Each agent must implement its own graph compilation logic.
   */
  protected abstract compile(): CompiledStateGraph<T, any, any, any, any, any>;

  async invoke(input: any, config?: RunnableConfig): Promise<any> {
    return this.graph.invoke(input, config);
  }

  async *streamEvents(input: any, config?: RunnableConfig): AsyncGenerator<any> {
    const eventStream = await this.graph.streamEvents(input, {
      ...config,
      version: 'v2'
    });

    for await (const event of eventStream) {
      yield event;
    }
  }
}

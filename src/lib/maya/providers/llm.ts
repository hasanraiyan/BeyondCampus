import { ChatOpenAI } from '@langchain/openai';

export interface ModelConfig {
  modelName: string;
  temperature: number;
  streaming?: boolean;
}

/**
 * Centrally manages LLM initialization and configuration.
 */
export class ModelProvider {
  static getOpenAI(config: Partial<ModelConfig> = {}) {
    const {
      modelName = process.env.OPENAI_MODEL_NAME || 'gpt-4o',
      temperature = 0.2,
      streaming = true,
    } = config;

    return new ChatOpenAI({
      modelName,
      openAIApiKey: process.env.OPENAI_API_KEY,
      configuration: {
        baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      },
      streaming,
      temperature,
    });
  }
}

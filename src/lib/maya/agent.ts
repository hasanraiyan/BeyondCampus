import { agentFactory } from './factory';
import { IAgent } from './core/types';

/**
 * Standard agent for university counseling.
 * Routes to the refactored Maya agent via the factory.
 */
export const universityAgent = agentFactory.getAgent('maya') as IAgent;

/**
 * For backward compatibility and specialized use
 */
export const mayaAgent = universityAgent;

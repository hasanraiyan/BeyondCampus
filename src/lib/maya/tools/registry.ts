import { StructuredTool } from '@langchain/core/tools';
import { search_knowledge } from './knowledge';
import { 
  list_programs, 
  search_programs, 
  get_program_details, 
  get_deadlines 
} from './university';

export const ALL_TOOLS: Record<string, StructuredTool> = {
  search_knowledge,
  list_programs,
  search_programs,
  get_program_details,
  get_deadlines,
};

export function getTools(names: string[]): StructuredTool[] {
  return names
    .map(name => ALL_TOOLS[name])
    .filter(tool => !!tool);
}

export const universityToolbox = [
  search_knowledge,
  list_programs,
  search_programs,
  get_program_details,
  get_deadlines,
];

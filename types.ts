export interface ParsedEvent {
  id: string;
  title: string;
  start: string; // ISO 8601 string
  end: string; // ISO 8601 string
  location?: string;
  description?: string;
  originalText?: string;
}

export enum ParsingStatus {
  IDLE = 'IDLE',
  PARSING = 'PARSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

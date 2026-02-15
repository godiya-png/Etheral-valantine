
export type RelationshipType = 'partner' | 'crush' | 'friend' | 'parent' | 'sibling';

export interface ValentineMessageRequest {
  recipientName: string;
  relationship: RelationshipType;
  additionalContext?: string;
}

export interface GeneratedMessage {
  quote: string;
  author?: string;
}

export interface SavedMessage extends GeneratedMessage {
  id: string;
  recipient: string;
  relationship: string;
  date: string;
}

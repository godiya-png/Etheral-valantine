
export type RelationshipType = 'partner' | 'crush' | 'friend' | 'parent' | 'sibling' | 'spouse' | 'anniversary' | 'long_distance';

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

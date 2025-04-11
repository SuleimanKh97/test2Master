// Request Interfaces
export interface GeminiRequestPart {
    text: string;
}

export interface GeminiRequestContent {
    parts: GeminiRequestPart[];
    // role?: string; // Optional: 'user' or 'model'
}

export interface GeminiRequestBody {
    contents: GeminiRequestContent[];
    // generationConfig?: GenerationConfig; // Optional: For temperature, topK, etc.
    // safetySettings?: SafetySetting[]; // Optional: For safety thresholds
}

// Response Interfaces
export interface GeminiResponsePart {
    text: string;
}

export interface GeminiResponseContent {
    parts: GeminiResponsePart[];
    role: string; // Typically 'model'
}

export interface SafetyRating {
    category: string;
    probability: string; // e.g., 'NEGLIGIBLE', 'LOW', 'MEDIUM', 'HIGH'
}

export interface GeminiResponseCandidate {
    content: GeminiResponseContent;
    finishReason: string; // e.g., 'STOP', 'MAX_TOKENS', 'SAFETY', 'RECITATION', 'OTHER'
    index: number;
    safetyRatings: SafetyRating[];
}

export interface PromptFeedback {
    safetyRatings: SafetyRating[];
    // blockReason?: string;
}

export interface GeminiResponse {
    candidates?: GeminiResponseCandidate[]; // Optional because an error/block might occur
    promptFeedback?: PromptFeedback;
    // error?: { code: number; message: string; status: string }; // For API errors
}

// Optional: Configuration interfaces if needed later
// export interface GenerationConfig {
//   temperature?: number;
//   topK?: number;
//   topP?: number;
//   maxOutputTokens?: number;
//   stopSequences?: string[];
// }
//
// export interface SafetySetting {
//   category: string; // e.g., 'HARM_CATEGORY_HARASSMENT'
//   threshold: string; // e.g., 'BLOCK_MEDIUM_AND_ABOVE'
// }

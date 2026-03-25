# Architecture Proposals

## Task 9: AI Stylist Chat Optimization

Sending the entire chat history with every request creates skyrocketing token costs and increases latency. I propose a "Sliding Window + Summarization" approach.

**1. Where should conversation history live?**
The full, raw chat history should live in the PostgreSQL database so the user can always read it. However, the AI should only receive a processed, shortened version in the active payload.

**2. How do you handle the AI model's token limit?**
I would handle this using two specific methods:
* **The "Top/Last" Window:** We do not send the whole chat. We send how it started (the first few messages) and how it is ending (the last 15 messages) so the AI knows the immediate conversational flow.
* **Cheaper Model Summarization:** For all the older messages in the middle, we run a background job using a cheaper, faster model (like Gemini Flash) to create a short summary of the user's established preferences. We then pass that short summary to the main model.

**3. What trade-offs does your approach have?**
* **Pros:** Massive reduction in token costs and much faster response times.
* **Cons:** The main AI might lose the exact, word-for-word details of the middle messages. It also requires the backend to manage and orchestrate two different AI models instead of just one.


## Task 10: "Outfit of the Day" Feature Design

**1. Recommendation Source (The Smart Engine)**
The base recommendation will come from the existing Python ML service (CLIP embeddings) that checks if clothes visually match, stored in the `outfit_suggestions` table. 

To make this super smart, I would add a Behavioral ML layer on top:
* **Personal History:** We track what the specific user buys, what they visit most, and even what time of day they shop.
* **Seasonal Context:** We use the current month, week, and upcoming festivals to recommend relevant clothes (e.g., traditional wear during festival weeks).
* **New User Fallback:** If a person has a brand new account with no history, we use collaborative data. We look at what the majority of other users are buying during that specific week or month and recommend those popular, trending combinations.

**2. Go Endpoint & Handler Signature**
I would add a new endpoint to fetch the daily outfit: `GET /api/v1/outfits/daily`

The Go handler function signature in `internal/handler/outfit.go` would be:
`func (h *OutfitHandler) GetDailyOutfit(w http.ResponseWriter, r *http.Request)`

**3. Frontend Hook Signature**
I would create a new React Hook in `hooks/useDailyOutfit.ts` following the app's existing patterns. 

It would look like this:
```typescript
interface UseDailyOutfitReturn {
  outfit: OutfitCombination | null;
  isLoading: boolean;
  error: string | null;
  dismissOutfit: (outfitId: string) => Promise<void>;
}

export const useDailyOutfit = (): UseDailyOutfitReturn => { ... }
# DiffDraft

DiffDraft is a small tool for a very specific frustration: after finishing a code change, I used to write one-line pull request descriptions such as “fixed stuff,” then lose review time explaining what I had already built. Other developers working in small teams have the same handoff problem. DiffDraft lets a developer paste the exact git diff they are about to submit and receive a structured, accurate starting point for the PR description. Success means turning a raw change set into a useful review context in seconds, without moving an API key into the browser.

## What It Does

The user pastes a git diff into the frontend. The frontend sends that diff to the product's own Express backend. The backend adds an instruction that requires four sections—Summary, Why, What to Review, and Testing—then sends the request to the language model. The generated Markdown is returned to the browser and can be copied into GitHub. The AI is the core value: without the transformation from code changes to explanation, the product is only a text box.

## AI Integration

**API:** OpenRouter  
**Model:** `openai/gpt-4o-mini`  
**Location:** `backend/server.js` → `generateDescription()`  
**What the AI does:** It transforms a git diff into a concise, evidence-based pull request description with review guidance.

The API key is read only from `process.env.OPENROUTER_API_KEY` in the backend. The frontend calls only `/api/generate` on the product backend; it contains no provider URL, model credential, or API key.

## What I Intentionally Excluded

I did not build user accounts or a database because the first useful version is session-based and a developer can copy the result into GitHub immediately. I excluded automatic GitHub OAuth and repository installation because they would introduce permissions and security review before validating the core writing workflow. I also excluded a multi-diff history because storing source code changes creates privacy and retention decisions that are not necessary for the MVP.

## Monthly Cost Calculation

The assignment's reference rates are used for a transparent estimate.

| Item | Arithmetic | Cost |
|---|---:|---:|
| Input tokens | 600 / 1,000,000 × $0.15 | $0.000090 |
| Output tokens | 400 / 1,000,000 × $0.60 | $0.000240 |
| One call | $0.000090 + $0.000240 | **$0.000330** |
| Expected usage | 300 calls × $0.000330 | **$0.099 ≈ $0.10/month** |

**Model:** `openai/gpt-4o-mini`  
**Input rate:** $0.15 per 1M tokens  
**Output rate:** $0.60 per 1M tokens  
**Average call:** approximately 600 input + 400 output tokens  
**Monthly total:** `300 × $0.000330 = $0.099`, approximately **$0.10/month**, excluding hosting.

## Live Deployment

**Frontend:** [Live DiffDraft frontend](https://4173-ix8bit4kztorujimi0qaf-78a8f760.sg1.manus.computer/)  
**Backend:** [Live backend health check](https://4010-ix8bit4kztorujimi0qaf-78a8f760.sg1.manus.computer/health)  

The walkthrough URLs above are public temporary hosting URLs for this submission. The backend is running with explicit `DEMO_MODE=true` so the evaluator can exercise the complete UI flow without a provider credential; production mode uses OpenRouter via the server-side `OPENROUTER_API_KEY`. The backend health check is available at `/health` and returns a JSON status object. Never commit `.env`; deploy `OPENROUTER_API_KEY` as a server-side environment variable.

## Local Development

From this directory, install and start the backend:

```bash
cd backend
npm install
cp .env.example .env
# Add a real OPENROUTER_API_KEY to backend/.env
npm start
```

Serve the frontend from a second terminal:

```bash
cd frontend
npx serve .
```

Then open the local frontend URL, choose **Use an example**, and click **Generate PR description**. Empty input, oversized input, backend errors, and loading states are handled in the UI.

## Video Walkthrough

[View the three-minute walkthrough on Google Drive](https://drive.google.com/file/d/19-pSwV6NSO6UNAtpjEwPanMGpva2cFPP/view?usp=sharing). The video covers the live demo, the backend validation function and its engineering rationale, and the frontend-to-backend request block.

## Ownership Notes

The backend validation and `generateDescription()` flow are the product's core engineering decisions. The input limit prevents accidentally sending an unbounded repository dump to the provider, while the explicit prompt asks the model not to invent tests or behavior. The frontend loading state disables duplicate submissions because a user clicking twice should not create two paid provider calls. The output remains plain Markdown so it can be reviewed before being pasted into GitHub.

## Video Walkthrough Plan

The three-minute walkthrough will show the live frontend, a genuine diff-to-description generation, the backend `generateDescription()` function and its environment-only key access, and the frontend request block as the AI-assisted section. The walkthrough will keep the camera visible throughout, as required by the assignment.

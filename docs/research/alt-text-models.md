# Model choice for automatic media alt text

Research date: 2026-09-19

## Recommendation

Use `google/gemini-3.1-flash-lite` as the primary model and `google/gemini-2.5-flash` as the fallback.

Gemini 3.1 Flash-Lite is the best fit for this narrowly scoped workload: it is a stable, low-latency multimodal model intended for high-volume lightweight tasks and simple extraction; it accepts image input, returns text, and supports JSON-schema structured output. On OpenRouter it costs $0.25 per million text or image input tokens and $1.50 per million output tokens. OpenRouter currently serves it through Google Vertex and Google AI Studio with provider failover. [Google model documentation](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite) · [OpenRouter model and provider data](https://openrouter.ai/google/gemini-3.1-flash-lite)

This stable model should replace the project's existing `google/gemini-3.1-flash-lite-preview` identifier for this new feature. The existing `google/gemini-2.5-flash` is a sensible fallback because it supports the same required modalities and structured output, is served through both Vertex and AI Studio, and is mature. It costs $0.30 per million image/input tokens and $2.50 per million output tokens. [OpenRouter Gemini 2.5 Flash data](https://openrouter.ai/google/gemini-2.5-flash/performance)

The preview identifier is no longer merely less desirable: Google shut it down on 2026-05-25 and explicitly directs users to `gemini-3.1-flash-lite`. Any existing translation configuration that still uses the preview ID should be migrated separately. [Google Gemini API release notes](https://ai.google.dev/gemini-api/docs/changelog#05-25-2026)

Google also offers the newer stable `gemini-3.5-flash-lite`, with image input and structured output. At OpenRouter's current $0.30/M input and $2.50/M output it costs more than 3.1, while Google's own 3.5 guidance continues to recommend 3.1 Flash-Lite for low-cost, high-volume tasks that do not need 3.5's deeper reasoning. A concise alt-text suggestion fits that profile, so newer does not make 3.5 the better default here. [Google 3.5 Flash-Lite model documentation](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite) · [Google 3.5 guidance](https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.5) · [OpenRouter comparison](https://openrouter.ai/compare/google/gemini-3.5-flash/google/gemini-3.5-flash-lite)

The recommendation is based on documented capabilities, current provider telemetry, price, and task fit. Before launch, it should still be validated against a small representative set of the property's own photographs; no first-party benchmark directly measures German alt-text quality for this exact domain.

## Candidate comparison

Prices below are OpenRouter list prices per one million tokens as of the research date. Image understanding is billed as image input tokens, not as a flat per-image charge; actual per-image cost therefore varies with image dimensions/tokenization. The response usage/cost should be logged during the project-specific evaluation.

| Model | Image input | Strict structured output | Input / image input | Output | Current operational signal | Fit |
| --- | --- | --- | ---: | ---: | --- | --- |
| `google/gemini-3.1-flash-lite` | Yes | Yes | $0.25 / $0.25 | $1.50 | Stable GA model; two Google provider routes with automatic failover | **Best balance.** Explicitly designed for low latency, high-volume lightweight multimodal work and simple extraction. |
| `google/gemini-3.5-flash-lite` | Yes | Yes | $0.30 / $0.30 | $2.50 | Stable GA model | Newer and capable, but costs more; Google still recommends 3.1 for inexpensive high-volume tasks without deeper reasoning. |
| `google/gemini-2.5-flash` | Yes | Yes | $0.30 / $0.30 | $2.50 | Multiple Vertex/AI Studio routes; current OpenRouter provider telemetry shows roughly 0.5–0.7 s median initial latency on the strongest routes and high availability | **Fallback.** More expensive, but mature and already used by this project's translation stack. |
| `google/gemini-2.5-flash-lite` | Yes | Yes | $0.10 / $0.10 | $0.40 | Very cheap and fast, but OpenRouter marks it as going away on 2026-10-20 | Not suitable as a new production dependency this close to retirement. |
| `openai/gpt-4.1-mini` | Yes | Yes | $0.40 | $1.60 | OpenAI and Azure (including an EU route) with automatic failover | Viable independent fallback, but not compelling enough to add a second model family for this simple task. OpenRouter does not list a separate image-input rate on the model page. |
| `anthropic/claude-haiku-4.5` | Yes | Yes | $1.00 | $5.00 | Broadest provider set of these candidates (Anthropic, Vertex, Azure and Bedrock routes) | Capable but materially more expensive; its extra reasoning capability is unnecessary for a one-sentence factual description. |

Sources: [Gemini 3.1 Flash-Lite](https://openrouter.ai/google/gemini-3.1-flash-lite), [Gemini 2.5 Flash](https://openrouter.ai/google/gemini-2.5-flash/performance), [Gemini 2.5 Flash-Lite](https://openrouter.ai/google/gemini-2.5-flash-lite/pricing), [GPT-4.1 Mini](https://openrouter.ai/openai/gpt-4.1-mini), [Claude Haiku 4.5](https://openrouter.ai/anthropic/claude-haiku-4.5/api).

## Accessibility constraint: image description is not always alt text

The model must receive usage context, not only the media file. W3C guidance distinguishes several outcomes:

- a meaningful photograph needs a brief description that conveys its purpose in the page context;
- a purely decorative or nearby-text-redundant image needs an empty alt value;
- an image used as a control or link needs its function or destination described;
- an image containing otherwise unavailable text needs that text represented;
- a complex graphic needs an explanation outside the short `alt` attribute.

These decisions cannot reliably be inferred from an isolated upload. The UI should therefore generate a **suggestion** and retain human confirmation, just as the current translation review does. Supply at least the image, locale, caption, containing page/block title and the image's role when known. See the [W3C alt decision tree](https://www.w3.org/WAI/tutorials/images/decision-tree/) and [W3C text-alternative tips](https://www.w3.org/WAI/tutorials/images/tips/).

For this Payload collection, `alt` is localized and required, while `caption` is localized and optional (`src/collections/Media.ts`). A practical structured response would contain `alt.de`, `alt.en`, `decorative`, and `confidence`, with a rule that a decorative result is represented by an explicit flag rather than silently invented descriptive copy. The existing required-field constraint will need a product decision if `alt=""` is to be supported correctly for decorative images.

## Suggested request behavior

- Use the original image or a bounded derivative suitable for vision analysis; do not use the image-generation API. This is image understanding with text output.
- Set thinking/reasoning to minimal or disabled, temperature to `0`, and cap the output tightly. Alt text should be a concise phrase or sentence, with the most important information first. [W3C guidance](https://www.w3.org/WAI/tutorials/images/tips/)
- Require a JSON schema so both localized values and the decorative/confidence decision are validated before being shown.
- Do not identify people, infer sensitive traits, or add facts that are not visibly supported or supplied in page context.
- Let an editor accept, edit, regenerate, or reject each suggestion. Do not overwrite a manually authored alt value.

## Privacy and routing

Media files are transmitted to OpenRouter and then to the selected inference provider. Model selection alone does not determine retention or geographic processing. For uploaded property imagery, set `provider.data_collection` to `"deny"` and `provider.zdr` to `true`; OpenRouter documents that these restrict routing to providers that do not collect the data and to zero-data-retention endpoints. If processing must remain in the EU, OpenRouter's guaranteed EU in-region endpoint is a Business/Enterprise feature. [OpenRouter sovereign routing and privacy controls](https://openrouter.ai/docs/guides/features/sovereign-ai)

Those restrictions can reduce the available provider pool, so the fallback must be tested with the exact routing policy enabled. Keep `require_parameters: true` so routing cannot silently choose an endpoint that lacks JSON-schema support.

## Acceptance test before implementation

Use 30–50 representative media items covering rooms, exterior views, details, people, text/signage and genuinely decorative imagery. Have a German-speaking editor rate each blind result for factuality, concision, usefulness in its actual page context, invented details, correct decorative handling and natural German. Compare the primary and fallback using identical prompts, resized images and context; record end-to-end latency and the API-reported cost. The recommendation should change only if that domain test shows a meaningful quality deficit.

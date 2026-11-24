# QuietQuorum research and selection

Research date: November 24, 2026. Recommendation: build a focused Web/Chrome prototype of QuietQuorum. This is a judgment about fit and feasibility, not a prediction of winning probability.

## Lessons from verified winners

The awards below come from organizer announcements. The lessons are our interpretation of those examples, not explanations supplied by the judges unless explicitly indicated.

| Competition | Winner and award | What it did | Lesson for our entry |
| --- | --- | --- | --- |
| Gemini API Developer Competition 2024 | Jayu, best overall | An assistant that interprets visual information and interacts with applications | Show a complete task happening, not just a generated answer |
| Gemini API Developer Competition 2024 | Vite Vere, most impactful and people's choice | Step-by-step assistance with everyday activities for people with cognitive disabilities | A specific audience makes the benefit understandable |
| Gemini API Developer Competition 2024 | Outdraw AI, most creative | A game where humans try to draw something recognizable to people but not AI | Give AI an essential, distinctive role |
| Gemini API Developer Competition 2024 | ViddyScribe, best web app | Adds audio descriptions to videos | Demonstrate a useful transformation with an obvious before and after |

[Google's Gemini competition announcement](https://developers.googleblog.com/announcing-the-winners-of-the-gemini-api-developer-competition/)

| Competition | Winner and award | What it did | Lesson for our entry |
| --- | --- | --- | --- |
| Chrome Built-in AI Challenge 2024, announced January 2025 | Mochi, best real-world extension | Adapts difficult web content for readers | Integrate assistance into an existing activity |
| Same competition | Orma, best hybrid AI extension | Makes browsing history a personal memory resource | Private local context can be a substantive part of hybrid architecture |
| Same competition | BrowseGraph, best hybrid AI extension | Connects browsing information through in-browser GraphRAG | Relationships between evidence can be the product |

[Chrome's 2024 challenge winners](https://developer.chrome.com/blog/ai-challenge-winners)

| Competition | Winner and award | What it did | Lesson for our entry |
| --- | --- | --- | --- |
| Chrome Built-in AI Challenge 2025 | Trail, best hybrid web application | An offline trail companion | Offline use should solve a real problem |
| Same competition | AAC Board AI, most helpful web application | Helps people compose messages privately and offline | Local execution should change the user's experience |
| Same competition | Pet Shelter App, best multimodal web application | Helps under-resourced shelters with adoption work | A narrow operational problem can have a compelling impact story |

[Chrome's 2025 challenge winners](https://developer.chrome.com/blog/ai-challenge-winners-2025)

| Competition | Winner and award | What it did | Lesson for our entry |
| --- | --- | --- | --- |
| Google Cloud ADK Hackathon 2025 | SalesShortcut, grand prize | A coordinated sales-development workflow | Demonstrate the sponsor technology through a coherent workflow |
| Same competition | GreenOps, Asia Pacific regional winner | Audits and optimizes cloud infrastructure for sustainability | Make outputs actionable and inspectable |

[Google Cloud's ADK winners](https://cloud.google.com/blog/products/ai-machine-learning/adk-hackathon-results-winners-and-highlights)

These examples do not establish that an accessibility theme, a particular stack, or a polished video guarantees a prize. We have no judge scoring data or complete comparison against unsuccessful entries.

## Current competition and existing products

Public search found close current entries in several plausible directions:

- [Portia](https://devpost.com/software/portia) and [KontrakKu](https://devpost.com/software/kontrakku): contract understanding with local extraction and cloud explanation.
- [Rounds](https://devpost.com/software/rounds-32g5b4) and [PocketOps AI](https://devpost.com/software/pocketops-ai): offline field or maintenance work with hybrid inference.
- [Access Bridge](https://devpost.com/software/access-bridge-nxtowc): face-to-face communication accessibility.

These are competitor self-descriptions, not independently verified performance claims or winners of the ongoing event. Search coverage is incomplete; private or unindexed entries may overlap our idea.

Offline qualitative analysis already exists. [Liminon](https://liminon.ai/) and [Harvey](https://ethnomethodology.github.io/harvey/) describe local interview-analysis or transcription workflows. QuietQuorum must not claim to invent private research software. Its proposed distinction is a small browser-based workflow for community listening: reviewed cloud payloads, source-linked findings, explicit conflicting evidence, and an inventory of notes missing from the synthesis.

## Candidate comparison

| Candidate | Strongest argument | Main weakness in this sprint | Decision |
| --- | --- | --- | --- |
| QuietQuorum: community listening and evidence synthesis | Local sensitive notes and cloud comparison have distinct jobs; disagreement creates a clear demo moment | Needs real user feedback; can become a generic summarizer if evidence handling is weak | Select |
| Private contract explainer | Easy-to-understand need and privacy benefit | Several close current entries; jurisdiction-specific interpretation adds risk and scope | Do not select |
| Offline maintenance copilot | Strong need for offline use and larger cloud context | Close competitors; equipment guidance needs domain validation | Do not select |
| AI lost-and-found | Clear human value and easy matching demonstration | Established products and past hackathon versions; local AI can feel optional | Reserve |
| General accessibility communicator | Significant user benefit | Close prior winners and current entries; meaningful accessibility validation takes time | Do not select for this sprint |

## Fit to this contest

The official criteria are equally weighted: technological implementation, design, potential impact, and quality of the idea. [Contest rules](https://firebasehybridaihackathon.devpost.com/rules)

Our proposed response to each:

- **Implementation:** demonstrate genuine on-device Firebase inference with networking disabled; use cloud synthesis only on approved excerpts; show actual inference origin.
- **Design:** a short workflow from notes to review to findings, with source evidence one click away.
- **Impact:** help a small community organization see what participants said, including constraints that a majority summary misses. Obtain feedback from actual prospective users before claiming usefulness.
- **Idea:** make contradictory and uncovered evidence a first-class output. A finding should not be accepted merely because its prose sounds confident.

## Name

QuietQuorum connects quiet voices with collective decisions. Exact-name searches in this research session did not surface an obvious matching product. This is a working project name, not a trademark or domain-availability determination. Earlier working names Groundthread and Fieldloom were dropped after existing brands were found.


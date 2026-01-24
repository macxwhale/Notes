# Instructor Guide – API Design Course

## Teaching Tips
- Emphasize **modular Flask design** early (Module 2)
- Reinforce **validation & serialization** (Module 3)
- Show real-world implications of **security misconfigurations** (Module 5 & 9)
- Use hands-on mini-projects to cement concepts

## Common Student Misunderstandings
- Confusing **access vs refresh tokens**
- Ignoring tenant isolation logic
- Misusing schemas and Marshmallow validation
- Not understanding the performance impact of N+1 queries

## Suggested Explanations
- Use analogies: JWT = “access card with expiration”
- Show before/after caching and compression performance
- Demonstrate multi-tenant isolation with multiple simulated tenants

## Pacing Advice
- Modules 1–4: Beginner → 2–3 days each
- Modules 5–8: Intermediate → 2–3 days each
- Modules 9–12: Advanced → 3–4 days each
- Mid-Course Project: 1 week
- Final Capstone: 2 weeks

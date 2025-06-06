You are an expert at analyzing unstructured user feedback and extracting structured insights. For each feedback string provided, follow these rules:

1. **Relevance Check**

   * First decide whether the feedback is relevant to product/user‐experience evaluation.
   * If it is **not** relevant, set `"isRelevant": false` and skip any further analysis (leave all other fields as empty lists or `null` as appropriate).
   * If it **is** relevant, set `"isRelevant": true` and proceed with the analysis steps below.

2. **Chain‐of‐Thought (Internal Reasoning)**

   * If `"isRelevant": true`, you may (internally) use chain‐of‐thought reasoning to identify sentiment, main subjects, positives, pain points, improvement suggestions, features mentioned, and user expertise.
   * Include chain-of-thought reasoning for sentiment analysis and isRelevant field into final output, but do not make it part of JSON. Rather place it as text comment before JSON.

3. **Sentiment Classification**

   * Classify overall sentiment as one of: `"Positive"`, `"Negative"`, `"Neutral"`, or `"Mixed"`.

4. **Main Subject**

   * Identify the primary topic or focus of the feedback (e.g., “Ergonomics and shape,” “Material quality,” “Feature improvements”).
   * If there is no clear subject, set `"mainSubject": null`.

5. **Positives**

   * List any explicitly praised aspects of the product or experience.

6. **Pain Points**

   * List any complaints, frustrations, or negative aspects identified.

7. **Improvement Suggestions**

   * List any explicit or strongly implied suggestions for improvement that the user makes.

8. **Features Mentioned**

   * Extract all product features or components referenced (e.g., “Ergonomics,” “Shape,” “Side buttons,” “Scrolling wheel,” “Shell material,” “Weight”).

9. **User Expertise**

   * Decide whether the user appears `"Experienced"`, `"Novice"`, or `"Unknown"` based on their language (e.g., references to competing products, specialized terminology).

10. **Output Format**
    * For each feedback piece output MUST INCLUDE the following sections: 
        - Sentiment chain-of-thought: PLACE YOUR REASONING STEPS FOR SENTIMENT HERE>
        - isRelevant chain-of-thought: PLACE YOUR REASONING STEPS FOR isRelevant field HERE
        - JSON output specified below

    * **Output ONLY a single JSON object** with exactly these keys (in this order):

      ```json
      {
        "sentiment": "string (Positive|Negative|Neutral|Mixed)",
        "isRelevant": boolean,
        "mainSubject": "string or null",
        "positives": ["array of strings"],
        "painPoints": ["array of strings"],
        "improvementSuggestions": ["array of strings"],
        "featuresMentioned": ["array of strings"],
        "userExpertise": "string (Experienced|Novice|Unknown)"
      }
      ```
    

---

### Few‐Shot Examples

**Feedback 1:**

```
"I've never been a fan of the GPX shape and to me, it feels like I am holding a potato. The front hump felt a bit intrusive on the backside of my knuckles. Ergonomics are better on the Viper V3 PRO specially on the rear portion of the mouse and the side part where you rest/grip your fingers to hold the mouse."
```

**Expected JSON:**

```json
{
  "sentiment": "Positive",
  "isRelevant": true,
  "mainSubject": "Ergonomics and shape (compared favorably to GPX)",
  "positives": [
    "Ergonomics are better on the Viper V3 PRO",
    "Better rear portion ergonomics",
    "Better side grip area"
  ],
  "painPoints": [],
  "improvementSuggestions": [],
  "featuresMentioned": [
    "Ergonomics",
    "Shape",
    "Rear design",
    "Side grip"
  ],
  "userExpertise": "Experienced"
}
```

---

**Feedback 2:**

```
"If you are a GPX lover, I think they managed to improve everything I thought It was wrong about the GPX series, they made the shape better, they fixed the side buttons, scrolling wheel is better, gliding is faster and feels like the perfect compromise between control and speed."
```

**Expected JSON:**

```json
{
  "sentiment": "Positive",
  "isRelevant": true,
  "mainSubject": "Feature improvements over competitor (GPX)",
  "positives": [
    "Better shape than GPX series",
    "Improved side buttons",
    "Better scrolling wheel",
    "Faster gliding with good control-speed balance"
  ],
  "painPoints": [],
  "improvementSuggestions": [],
  "featuresMentioned": [
    "Shape",
    "Side buttons",
    "Scrolling wheel",
    "Gliding performance"
  ],
  "userExpertise": "Experienced"
}
```

---

**Feedback 3:**

```
"I can't say I'm a fan of the material used for the shell, either—the plastic attracts fingerprints like a grease magnet and the mouse needed to be furiously cleaned, repeatedly, before any pictures could be taken. It also feels a bit on the cheap side, although that's mostly down to Razer's decision to make the Viper V3 Pro as light as possible."
```

**Expected JSON:**

```json
{
  "sentiment": "Negative",
  "isRelevant": true,
  "mainSubject": "Material quality and feel",
  "positives": [],
  "painPoints": [
    "Shell material attracts fingerprints excessively",
    "Requires frequent cleaning",
    "Material feels cheap",
    "Design prioritizes weight over premium feel"
  ],
  "improvementSuggestions": [
    "Use material that resists fingerprints better",
    "Improve perceived build quality while maintaining low weight"
  ],
  "featuresMentioned": [
    "Shell material",
    "Build quality feel",
    "Weight"
  ],
  "userExpertise": "Experienced"
}
```

---

### Now Analyze the New Feedback




**Feedback 1** 
```
 "Sensor just stops tracking for like a half second kinda often even at 8000hz. I've also tried it plugged in and still the same problem. First one I got I had to return also because the dongle just didnt work, $150 mouse btw" 
 ``` 
 **Feedback 2** 
 ```
 "Is it worth it? It is a product with no flaws in my opinion, if you love it go for it, but its not worth the price since you'll be able to perform the same with a cheaper product with half the specs." 

``` 
**Feedback 3** 
``` 
Play Raid Shadow Legends NOW!!! Click here to continue. 
``` 

Your response must be **only** the JSON object described above.

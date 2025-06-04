---

You are an AI assistant specialized in text analysis. When given an input text, perform the following tasks and return the results in **one strict JSON object**, with **no extra explanations or text outside of the JSON**.

### 🔧 Tasks:

1. **`summary`**

   * Write a clear, concise summary of the input.
   * Use **1–2 full sentences**, no bullet points or fragments.
   * Limit the summary to **under 40 words**.

2. **`sentiment`**

   * Analyze the **overall tone** of the text.
   * Classify the sentiment as one of the following:

     * `"positive"`
     * `"neutral"`
     * `"negative"`
   * Choose the label that best reflects the **dominant mood** of the entire text.

3. **`sentiment_score`**

   * Assign a numeric score that matches the `sentiment` value:

     * `1` for `"positive"`
     * `0` for `"neutral"`
     * `-1` for `"negative"`

---

### 📦 Output Format (strict):

```json
{
  "summary": "<your 1–2 sentence summary here>",
  "sentiment": "<\"positive\" | \"neutral\" | \"negative\">",
  "sentiment_score": <-1 | 0 | 1>
}
```

---

### 📝 Input text:

```
Remote work, also known as telecommuting, has become increasingly popular in recent years, particularly after the global pandemic forced many companies to adapt to flexible working arrangements. The advantages of remote work are numerous. Employees often report higher job satisfaction due to the elimination of long commutes, increased flexibility in managing work-life balance, and the ability to work from the comfort of their homes. For companies, remote work can lead to lower operational costs, since there is less need for office space and associated expenses.
However, remote work is not without its challenges. Many employees struggle with feelings of isolation and a lack of connection to their colleagues, which can negatively impact collaboration and team dynamics. Moreover, some workers find it difficult to maintain productivity due to distractions at home or the blurred boundaries between personal and professional life. Employers, on the other hand, may face difficulties in monitoring employee performance and ensuring consistent communication across teams.
Despite these challenges, remote work is likely here to stay. Companies are exploring hybrid models that combine the benefits of in-office collaboration with the flexibility of remote work. As technology continues to improve, tools for video conferencing, project management, and team communication are making it easier than ever for businesses to thrive in a remote or hybrid environment.

```

---

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const apiKey = "AIzaSyDhfeanHiRbyV0Vyrp7_YSgfvN5NTzY_PI";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Endpoint to generate analysis
app.post('/analyze', async (req, res) => {
  const documents = req.body.documents; // Assuming the documents are sent in the request body as an array

  if (!documents || !Array.isArray(documents)) {
    return res.status(400).json({ error: 'Documents array is required' });
  }

  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          { text: "I have an array of documents that have the following information, article, title, keywords, tag, region, country and date. I need you to go through the array and provide a basic analysis of it, giving an idea on how the general topic is trending for that time period and your view on the popularity of it in other regions. Return as one paragraph. Make it sound natural and do not mention the array of data provided." },
        ],
      },
      {
        role: "model",
        parts: [
          { text: "Please provide me with the array of documents you mentioned,including the article, title, keywords, tag, region, country, and date for each document. Once I have this information, I can analyze the data and provide you with a concise and natural-sounding paragraph that summarizes the trends and popularity of the topic across different regions during the specified time period. Mention similar stories were possible but dont dwell on the current story too much. I also want you to suggest what could be driving the trend. No general statements like 'there appears to be trend where' nothing obvious, speak plainly no filler " },
        ],
      },
    ],
  });

  try {
    const result = await chatSession.sendMessage(JSON.stringify(documents));
    res.json({ analysis: result.response.text() });
  } catch (error) {
    console.error('Error generating analysis:', error);
    res.status(500).json({ error: 'Failed to generate analysis' });
  }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

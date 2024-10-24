const express = require('express');
const { SessionsClient } = require('@google-cloud/dialogflow-cx');
const uuid = require('uuid');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());

// Load service account credentials from the JSON file
const projectId = process.env.DIALOGFLOW_PROJECT_ID; // Your Dialogflow project ID
const location = 'global'; // Set the correct region for your agent, e.g., 'us-central1'
const agentId = 'b0bb4be3-611a-4722-9458-a3be48af3046'; // Replace with your Dialogflow CX agent ID

let sessionClient;
try {
  sessionClient = new SessionsClient({
    keyFilename: path.join(__dirname, 'noted-casing-438604-a8-bf7bae8d2912.json'),
  });
  console.log('Dialogflow CX session client initialized successfully');
} catch (err) {
  console.error('Error initializing Dialogflow CX session client:', err);
}

app.post('/dialogflow', async (req, res) => {
  const { message } = req.body;

  // A unique session ID for each conversation
  const sessionId = uuid.v4();
  const sessionPath = sessionClient.projectLocationAgentSessionPath(
    projectId, location, agentId, sessionId
  );

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
      },
      languageCode: 'en-US', // Change to your language
    },
  };

  try {
    const [response] = await sessionClient.detectIntent(request);
    const result = response.queryResult;
    console.log('Dialogflow CX response:', result);
    res.json({ fulfillmentText: result.responseMessages[0].text.text[0] });
  } catch (err) {
    console.error('ERROR in /dialogflow:', err);
    res.status(500).send('Error connecting to Dialogflow CX');
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

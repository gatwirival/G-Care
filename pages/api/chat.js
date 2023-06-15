import { Message, initialMessages } from '../components/MessageDisplay';
import { config as dotenvConfig } from 'dotenv';
import fetch from 'node-fetch';
import { createServer } from 'http';

dotenvConfig();

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing Environment Variable OPENAI_API_KEY");
}

const botName = "AI";
const userName = "User";

const generatePromptFromMessages = (messages) => {
  let prompt = "";
  prompt += messages[1].message;
  const messagesWithoutFirstConvo = messages.slice(2);

  if (messagesWithoutFirstConvo.length === 0) {
    return prompt;
  }

  messagesWithoutFirstConvo.forEach((message) => {
    const name = message.who === "user" ? userName : botName;
    prompt += `\n${name}: ${message.message}`;
  });
  return prompt;
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const body = req.body;
    const messagesPrompt = generatePromptFromMessages(body.messages);
    const defaultPrompt = `${botName}: ${initialMessages[0].message}\n${userName}: ${messagesPrompt}\n${botName}: `;

    const payload = {
      model: "text-davinci-003",
      prompt: defaultPrompt,
      temperature: 0.7,
      max_tokens: 200,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: [`${botName}:`, `${userName}:`],
      user: body?.user,
    };

    const requestHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    };

    try {
      const response = await fetch("https://api.openai.com/v1/completions", {
        headers: requestHeaders,
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.error) {
        console.error("OpenAI API error: ", data.error);
        return res.status(500).json({
          text: `ERROR with API integration. ${data.error.message}`,
        });
      }

      return res.json({ text: data.choices[0].text });
    } catch (error) {
      console.error("Error occurred: ", error);
      return res.status(500).json({ text: "An error occurred." });
    }
  } else {
    res.status(404).json({ message: 'Not found' });
  }
}
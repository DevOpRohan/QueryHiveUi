import { ChatOpenAI } from "langchain/chat_models/openai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "./.env") });
const openai_api_key = process.env.OPENAI_API_KEY;
const chat = new ChatOpenAI({ modelName: "gpt-4", temperature: 0 });

const run = async (history) => {
  console.log(history);
  console.log("ApiKey: " + openai_api_key);
  const response = await chat.call(history);
  console.log(response);
  return response;
};

export default run;

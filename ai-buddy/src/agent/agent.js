const {StateGraph , MessagesAnnotation} = require('@langchain/langgraph')
const { ChatGroq }  = require("@langchain/groq")

const llm = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    maxTokens: undefined,
    maxRetries: 2,
   
})
const message  = [
    {
      role: "system",
      content: "You are a helpful assistant that translates English to French. Translate the user sentence.",
    },
    { role: "user", content: "I love programming." },
];




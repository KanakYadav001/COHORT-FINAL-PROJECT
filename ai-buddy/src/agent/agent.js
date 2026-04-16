require("dotenv").config();
const { StateGraph, MessagesAnnotation } = require("@langchain/langgraph");
const { ChatGroq } = require("@langchain/groq");
const { ToolMessage} = require("@langchain/core/messages");

const tools = require("./tools");

const llm = new ChatGroq(
  {
    model: "llama-3.3-70b-versatile", 
    temperature: 0.5, 
    tool_choice: "auto",
    apiKey: process.env.GROQ_API_KEY,
  },
);

const toolMap = {
  searchProduct: tools.searchProduct,
  createCart: tools.createCart,
};


const graph = new StateGraph(MessagesAnnotation)


  .addNode("tools", async (state, config) => {
    const lastMessage = state.messages[state.messages.length - 1];
    const toolCalls = lastMessage.tool_calls || [];

    const toolCallResult = [];
    for (const call of toolCalls) {
        const tool = toolMap[call.name];
        if (!tool) {
           console.warn(`Tool not found: ${call.name}`);
          continue;
        }

        const toolInput = { ...call.args, token: config.configurable?.token };
   

        const toolResult = await tool.invoke(toolInput);
     
        toolCallResult.push(
          new ToolMessage({
            content:  typeof toolResult === "string"? toolResult: JSON.stringify(toolResult, null, 2),
            name: call.name,
            tool_call_id: call.id,
          }),
        );
      }
    state.messages.push(...toolCallResult);
  
    return state;
  })
  .addNode("chat", async (state) => {
    const llmWithTools =  llm.bindTools(
      [tools.searchProduct, tools.createCart]
    ); 

  

    const response = await llmWithTools.invoke(state.messages);
console.log("LLM Response:", response);
    state.messages.push(response);
    return state;
  })
  .addEdge("__start__", "chat")
  .addConditionalEdges("chat", (state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    const hasToolCalls = Array.isArray(lastMessage.tool_calls) && lastMessage.tool_calls.length > 0;


    if (hasToolCalls) {
      return "tools";
    } else {
      return "__end__";
    }
  })
  .addEdge("tools", "chat");

const agent = graph.compile();

module.exports = agent;

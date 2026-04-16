const { Server } = require("socket.io");

const jwt = require("jsonwebtoken");
const { HumanMessage , SystemMessage } = require("@langchain/core/messages");
const agent = require("../agent/agent");

async function integrateSocket(httpsServer) {
  const io = new Server(httpsServer, {});

  io.use((socket, next) => {


    const token = socket.handshake.headers.cookie;

    if (!token) {
      return next(new Error("token not found"));
    }

    try {
      const decoaded = jwt.verify(token, process.env.JWT_TOKEN);
      socket.user = decoaded;
      socket.token = token;
      next();
    } catch (err) {
      return next(new Error("Invalid Token !!!"));
    }
  });

  io.on("connection", (socket) => {


    console.log(socket.token, socket.user);

    console.log("A user connected");

     socket.chatHistory = socket.chatHistory || [];

  // ✅ System Message (ONLY ONCE)
  if (socket.chatHistory.length === 0) {
    socket.chatHistory.push(
      new SystemMessage(`You are a shopping assistant.

RULES:
1. Call ONLY one tool at a time
2. First search → then wait → then add to cart
3. Always return product ID
4. Be conversational`)
    );
  }

    socket.on("message", async (data) => {
   
        console.log("user Message : ", data);

    socket.chatHistory.push(new HumanMessage({ content: data }));

        const agentResponse = await agent.invoke(
          {
            messages: socket.chatHistory,
            
          },{
          configurable: {
              token: socket.token,
          },
          recursionLimit:10
        }
        );

    socket.chatHistory = agentResponse.messages;

    // limit memory
    const MAX_HISTORY = 10;
    socket.chatHistory = socket.chatHistory.slice(-MAX_HISTORY);


        const finalResponse =
          agentResponse.messages[agentResponse.messages.length - 1];

        console.log("agent response ", finalResponse.content);

        socket.emit("response", {
          message: finalResponse?.content || "Sorry, I couldn't process your request.",
        });
      
    });
  });
}

module.exports = { integrateSocket };

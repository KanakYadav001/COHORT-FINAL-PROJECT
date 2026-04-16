const axios = require("axios");
const { tool } = require("@langchain/core/tools");
const { z } = require("zod");



const searchProduct = tool(
  async ({ q, token }) => {
    const response = await axios.get(
      `http://localhost:3001/api/product?q=${q}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return JSON.stringify(response.data);
  },
  {
    name: "searchProduct",
    description:
      "Use this tool to search for products based on a user query and return a list of relevant products.",
    schema: z.object({
      q: z.string(),
      token: z.string().optional(),
    }),
  },
);

const createCart = tool(
  async ({ productId, quantity = 1, token }) => {
    
      const response = await axios.post(
        `http://localhost:3002/api/cart/items`,
        {
          productId,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return JSON.stringify({
        message: "Items added successfully",
        data: response.data,
      });
   
  },
  {
    name: "createCart",
    description:"Use this tool to add a product to the user's cart.",
    schema: z.object({
      productId: z.string(),
      quantity: z.number().default(1),
      token: z.string().optional(),
    }),
  },
);

module.exports = {
  searchProduct,
  createCart,
};

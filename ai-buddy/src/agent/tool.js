const {tool} = require('@langchain/core/tools');

const axios = require('axios');
const { z } = require('zod');


const searchProdust = tool(async ({query,token})=>{

     const response = await axios.get(`http://localhost:3001/api/product?q=${data.query}`,{
        headers : {
            Authorization : `Bearer ${token}`
        }
     });


 return JSON.stringify(response.data);

},{

    name : 'search_product',
    description : 'Search for a product in the database',
   input  : z.object({
    query  : z.string().describe('The search query for products')
   })

})



const addProductToCart = tool(async({productId ,quantity=1,token})=>{ 
  
    const cart  = await axios.post(`http://localhost:3001/api/cart/items`,{productId, quantity},{
        headers : {
            Authorization : `Bearer ${token}`
        }
     });

     return `Product with ID ${productId} added to cart with quantity ${quantity}`

},{

    name : 'add_product_to_cart',
    description : 'Add a product to the cart',
     input : z.object({
        productId : z.string().describe("The ID of the product to add to the cart"),
        quantity : z.number().describe("The quantity of the product to add to the cart").default(1)
     })
})


module.exports = {
    searchProdust,
    addProductToCart
}
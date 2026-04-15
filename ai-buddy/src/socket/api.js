const { axios } = require('axios')
const { tools } = require('@langchain/core/tools')




const getProduct = tools(async({q,token})=>{
  
   const response = await axios.get(`http://localhost:3001/api/product?q=${q}`,{
     headers : {
       Authorization : `Bearer ${token}`
     }
   })

  return JSON.stringify(response.data)

},{
    name : "searchProduct",
    description : "Search Product Based On queue",
    scema : z.object({
        query : z.string().describe("Hello search this ")
    })
})



const Createcart = tools(async({productId,qty =1 ,token})=>{
  
   const response = await axios.get(`http://localhost:3002/api/cart/items`,{
   productId,
   qty   

},{
     headers : {
        Authorization : `Bearer ${token}`
     }
   })

  
   return "Items added sucessfully"

},{
    name : "Create Cart",
    description : "Add Product in cart Choose by user",
    scema : z.object({
        productId : z.string().describe("The id of added product in the cart "),
        qty : z.number().describe("quantity of the product").default(1)
    })
})


module.exports ={
    getProduct,
    Createcart
}
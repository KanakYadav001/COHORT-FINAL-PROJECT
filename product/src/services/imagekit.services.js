const { ImageKit } = require('@imagekit/nodejs');
const  {v4 : uuidv4} = require('uuid')

const client = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

async function UploadImage(file , folder='/products') {
  try {
    const response = await client.files.upload({
      file: file.buffer.toString("base64"),
      fileName: uuidv4(),
      folder: folder
    });

    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = {
  UploadImage
};
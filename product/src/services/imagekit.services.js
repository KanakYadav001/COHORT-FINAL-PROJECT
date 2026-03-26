const { ImageKit } = require('@imagekit/nodejs');

const client = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

async function UploadImage(file) {
  try {
    const response = await client.files.upload({
      file: file.buffer.toString("base64"),
      fileName: file.originalname,
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
const ngrok = require('ngrok');

const config = {
  authtoken: '2aahwprCc1NFoP19Q1mUyKcsZf7_3h1Jbv3Gwf1xdhiecbVLa',
  addr: process.env.PORT || 3000,
  region: 'us'
};

async function startNgrok() {
  try {
    const url = await ngrok.connect(config);
    console.log('Ngrok tunnel established at:', url);
    return url;
  } catch (error) {
    console.error('Error starting ngrok:', error);
    throw error;
  }
}

module.exports = { startNgrok }; 
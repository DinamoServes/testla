const { spawn } = require('child_process');
const { startNgrok } = require('../ngrok.config');

async function startServer() {
  try {
    // Start ngrok tunnel
    const ngrokUrl = await startNgrok();
    console.log('Ngrok tunnel established at:', ngrokUrl);

    // Start Next.js development server
    const nextProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        NGROK_URL: ngrokUrl
      }
    });

    nextProcess.on('error', (error) => {
      console.error('Failed to start Next.js server:', error);
    });

    // Handle process termination
    process.on('SIGINT', () => {
      nextProcess.kill();
      process.exit();
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 
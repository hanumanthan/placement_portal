const app = require('./app');
require('./config/db'); // Initialize pool & test connection
const { initCronJobs } = require('./config/cron');

const PORT = process.env.PORT || 5000;

// Initialize background scheduled tasks
initCronJobs();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Allowed Client Origin: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});

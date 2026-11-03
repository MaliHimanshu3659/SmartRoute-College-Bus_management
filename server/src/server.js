const app = require('./app');
require('dotenv').config();

const PORT = parseInt(process.env.PORT || '3000', 10);

app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  SmartRoute Express Server Running on port ${PORT}`);
    console.log(`  Local URL: http://localhost:${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
});

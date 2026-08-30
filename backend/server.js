const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const env = require('./config/env');
const { initDatabase } = require('./config/database');
const errorHandler = require('./middleware/error.middleware');

// Routes
const authRoutes = require('./routes/auth.routes');
const companyRoutes = require('./routes/company.routes');
const approvalRoutes = require('./routes/approval.routes');
const applicationRoutes = require('./routes/application.routes');
const documentRoutes = require('./routes/document.routes');
const complianceRoutes = require('./routes/compliance.routes');
const schemeRoutes = require('./routes/scheme.routes');
const aiRoutes = require('./routes/ai.routes');
const notificationRoutes = require('./routes/notification.routes');
const officerRoutes = require('./routes/officer.routes');
const adminRoutes = require('./routes/admin.routes');
const reportRoutes = require('./routes/report.routes');
const searchRoutes = require('./routes/search.routes');

const app = express();

// Security Middlewares
app.use(helmet({
    contentSecurityPolicy: false // Disabled CSP for prototype local asset inline scripts/CSS
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// Serve File Uploads
app.use('/uploads', express.static(env.UPLOAD_DIR));

// Serve Frontend Static Files
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// API Router Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/officer', officerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/search', searchRoutes);

// Healthcheck Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'UdyamSetu AI Service Operating Normally',
        timestamp: new Date().toISOString()
    });
});

// SPA Fallback: Serve index.html for non-API client routes
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ success: false, message: 'API Endpoint Not Found' });
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Centralized Error Middleware
app.use(errorHandler);

// Boot Server & Initialize Database
async function startServer(port = env.PORT) {
    try {
        await initDatabase();
        const server = app.listen(port, () => {
            console.log(`=======================================================`);
            console.log(`🚀 UdyamSetu AI Backend Running on Port ${port}`);
            console.log(`🌐 Application URL: http://localhost:${port}`);
            console.log(`=======================================================`);
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`⚠️ Port ${port} is currently in use by another process.`);
                console.log(`💡 Tip: You can close the existing process or start on an alternate port.`);
            } else {
                console.error('Server error:', err);
            }
        });

        return server;
    } catch (error) {
        console.error('Fatal Server Startup Error:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    startServer();
}

module.exports = app;

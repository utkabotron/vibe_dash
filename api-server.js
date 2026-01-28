const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Cache configuration
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
let cache = {
    data: null,
    timestamp: null
};

// Google Sheets configuration
const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1J9e3IjP42Bl29sJtVzzQ5LmbisnpERfT8Bb8IKLAGIo';
const SHEET_NAME = 'Reports';

/**
 * Initialize Google Sheets API client
 */
function getGoogleSheetsClient() {
    let credentials;

    // Try to load credentials from environment variable or file
    if (process.env.GOOGLE_SHEETS_CREDENTIALS) {
        credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
    } else if (process.env.GOOGLE_SHEETS_CREDENTIALS_PATH) {
        credentials = require(process.env.GOOGLE_SHEETS_CREDENTIALS_PATH);
    } else {
        throw new Error('Google Sheets credentials not configured');
    }

    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    return google.sheets({ version: 'v4', auth });
}

/**
 * Fetch data from Google Sheets
 */
async function fetchSheetData() {
    try {
        const sheets = getGoogleSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:K`, // Adjust range based on your sheet structure
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return [];
        }

        // First row is headers
        const headers = rows[0];
        const data = [];

        // Convert rows to objects
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const record = {};

            headers.forEach((header, index) => {
                record[header] = row[index] || '';
            });

            data.push(record);
        }

        return data;
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        throw error;
    }
}

/**
 * Get cached data or fetch new data
 */
async function getData() {
    const now = Date.now();

    // Return cached data if still valid
    if (cache.data && cache.timestamp && (now - cache.timestamp < CACHE_DURATION)) {
        console.log('Returning cached data');
        return cache.data;
    }

    // Fetch new data
    console.log('Fetching fresh data from Google Sheets');
    const data = await fetchSheetData();

    // Update cache
    cache.data = data;
    cache.timestamp = now;

    return data;
}

/**
 * API Endpoints
 */

// Get all reports data
app.get('/api/reports', async (req, res) => {
    try {
        const data = await getData();
        res.json({
            success: true,
            data: data,
            cached: cache.timestamp ? Date.now() - cache.timestamp < CACHE_DURATION : false,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in /api/reports:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch data',
            message: error.message
        });
    }
});

// Get projects list (unique project names)
app.get('/api/projects', async (req, res) => {
    try {
        const data = await getData();
        const projects = [...new Set(data.map(record => record.project_name).filter(Boolean))];
        res.json({
            success: true,
            data: projects.sort()
        });
    } catch (error) {
        console.error('Error in /api/projects:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch projects'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        cache: {
            valid: cache.data && cache.timestamp && (Date.now() - cache.timestamp < CACHE_DURATION),
            age: cache.timestamp ? Date.now() - cache.timestamp : null
        }
    });
});

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║   Vibe Analytics Dashboard API Server     ║
╠════════════════════════════════════════════╣
║   Server running on: http://localhost:${PORT}
║   Spreadsheet ID: ${SPREADSHEET_ID}
║   Cache duration: ${CACHE_DURATION / 1000 / 60} minutes
╚════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    process.exit(0);
});

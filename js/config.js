// Oasis Admin Portal - Configuration

const CONFIG = {
    // Password (simple auth)
    PASSWORD: 'oasis2024',

    // Supabase Configuration
    SUPABASE_URL: 'https://tzsatbviltcvelicbxoa.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2F0YnZpbHRjdmVsaWNieG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MzM1MzAsImV4cCI6MjA5MDMwOTUzMH0.y8TxI5GFeKPgtXnkJ8Z83O0C7pJHvWCZVtJo2Oon6xw',

    // Session settings
    SESSION_KEY: 'oasis_admin_session',
    SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

// Check if we're using mock data (Supabase not configured)
CONFIG.USE_MOCK = CONFIG.SUPABASE_URL === 'YOUR_SUPABASE_URL';

// Mock data for testing
const MOCK_SITES = [
    {
        id: 1,
        business_name: 'Golf Coast Pilot',
        deployment_url: 'https://golfcoastpilot.vercel.app',
        github_url: 'https://github.com/arentz1234-code/golfcoastpilot-demo',
        site_path: '/Users/andrewrentz/oasis-pipeline/sites/golfcoastpilot',
        original_url: 'https://www.golfcoastpilot.com/',
        contact_email: 'golfcoastpilot@gmail.com',
        recipient_email: 'arentz1234@gmail.com',
        location: 'Alabama, Georgia, Florida',
        status: 'live',
        email_sent: true,
        email_message_id: '19d3672ac433c36a',
        viewed: false,
        view_count: 0,
        created_at: new Date().toISOString(),
    }
];
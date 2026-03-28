// Oasis Admin Portal - Configuration

const CONFIG = {
    // Password (simple auth)
    PASSWORD: 'oasis2024',

    // Supabase Configuration
    // You'll need to replace these with your actual Supabase credentials
    SUPABASE_URL: 'YOUR_SUPABASE_URL',
    SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',

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

// Supabase Configuration
// IMPORTANT: Replace these placeholders with your actual Supabase project details
const supabaseUrl = 'https://xislibslnsqktgwurgnh.supabase.co';
const supabaseKey = 'sb_publishable_dCh5Oh_ZU-ilXLqgkHNDyg_hggs7byc';

// Initialize the Supabase client
// Make sure you have included the Supabase JS library in your HTML before this script:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

try {
  if (window.supabase && window.supabase.createClient) {
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    window.supabaseClient = supabase;
  } else if (window.Supabase && window.Supabase.createClient) {
    const supabase = window.Supabase.createClient(supabaseUrl, supabaseKey);
    window.supabaseClient = supabase;
  } else {
    console.error('Supabase library not found in window.');
  }
} catch (err) {
  console.error('Error initializing Supabase client:', err);
}

// Export for module systems (Node.js/Webpack)
if (typeof module !== 'undefined' && module.exports) {
  // Note: This won't work if supabase isn't defined, but we are primarily targeting browser here
  if (typeof supabase !== 'undefined') module.exports = supabase;
}

console.log('Supabase client initialized');

const supabaseUrl = 'https://bkkcrmxxqftgyegdotnh.supabase.co';
const anonKey = 'sb_publishable_p9BvyaPEvilfk0xsS4aFLw_er7tJzgR';

async function test() {
  console.log("Testing tables on Supabase via REST API...");
  const tables = ['courses', 'lessons', 'enrollments', 'activation_codes', 'lesson_progress', 'video_view_logs'];
  
  for (const table of tables) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${table}?limit=1`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log(`Table '${table}' exists! Status: ${response.status}. Data:`, data);
      } else {
        const errorText = await response.text();
        console.log(`Table '${table}' does not exist or error. Status: ${response.status}. Error:`, errorText);
      }
    } catch (err) {
      console.log(`Table '${table}' request failed:`, err.message);
    }
  }
}

test();

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);

    if (pathname === '/query' && request.method === 'POST') {
      const { table, data } = await request.json();

      if (!table || typeof data !== 'object') {
        return new Response("Invalid payload", { status: 400 });
      }

      const keys = Object.keys(data);
      const placeholders = keys.map(() => '?').join(', ');
      const values = Object.values(data);

      // Auto-create table if it doesn't exist
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS ${table} (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ${keys.map(k => `${k} TEXT`).join(', ')}
        );
      `;
      await env.DB.exec(createTableSQL);

      const insertSQL = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
      await env.DB.prepare(insertSQL).bind(...values).run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response("Not Found", { status: 404 });
  }
}
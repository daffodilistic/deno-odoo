import { Client } from "https://deno.land/x/postgres@v0.12.0/mod.ts";

async function startWebserver(psqlClient: Client, serverPort: number) {
  const server = Deno.listen({ port: serverPort });
  console.log(`HTTP webserver running.  Access it at:  http://localhost:${serverPort}/`);

  for await (const conn of server) {
    serveHttp(conn);
  }

  async function serveHttp(conn: Deno.Conn) {
    const httpConn = Deno.serveHttp(conn);
    for await (const requestEvent of httpConn) {
      const requestData = await requestEvent.request.json();
      // console.log("Body is", requestData);

      const result = await psqlClient.queryObject(`
        SELECT rp.id, rp.name, rp.email, rp.customer_id, ia.store_fname 
        FROM res_partner rp
        LEFT join ir_attachment ia on ia.res_id = rp.id
        AND ia.res_model = 'res.partner'
        AND ia.res_field = 'image_medium'
        WHERE customer_id = '${requestData.customer_id}'
        LIMIT 1`);
      // console.log(result.rows[0]);

      const response = result.rows[0];
      requestEvent.respondWith(
        new Response(JSON.stringify(response), {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          },
        }),
      );
    }
  }
}

export { startWebserver };

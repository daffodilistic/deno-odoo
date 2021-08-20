import { Client } from "https://deno.land/x/postgres@v0.12.0/mod.ts";
import { startWebserver } from "./webserver.ts";

// Sample JSON for env.json
// {
//   "user": "postgres",
//   "password": "odoo",
//   "database": "odoo",
//   "hostname": "localhost",
//   "port": 5432
// }
const ENV_FILE = JSON.parse(await Deno.readTextFile("./env.json"));
const client = new Client(ENV_FILE);

// Connect to PostgreSQL server first, and exit gracefully if it fails
await client.connect();
if (client.connected) {
  startWebserver(client, 8080);
} else {
    console.log("Error: Unable to connect to SQL server, terminating!");
    Deno.exit(1);
}

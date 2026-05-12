import { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const body = event.isBase64Encoded 
    ? Buffer.from(event.body || "", "base64").toString("utf-8")
    : event.body || "{}";

  let commandKey = "";
  try {
    const data = JSON.parse(body);
    commandKey = data.commandKey || "";
  } catch (e) {
    console.error("[AUTH] Failed to parse event body:", body);
    return { statusCode: 400, body: "Invalid JSON" };
  }
  
  console.log(`[AUTH] Login attempt received. Key length: ${commandKey.trim().length}`);
  
  // Since we can't persist to a file on Netlify without a database, 
  // we use environment variables as the source of truth.
  const keys: Record<string, string> = {
    'CEO': process.env.CEO_ACCESS_KEY || 'CEO_MADECC_2026',
    'PROJECT_MANAGER': process.env.PM_ACCESS_KEY || 'PM_MADECC_2026',
    'CONTENT_EDITOR': process.env.CE_ACCESS_KEY || 'CE_MADECC_2026',
    'FINANCIAL_OFFICER': process.env.FO_ACCESS_KEY || 'FO_MADECC_2026',
    'ACCOUNTANT': process.env.ACC_ACCESS_KEY || 'ACC_MADECC_2026',
    'SECRETARY': process.env.SEC_ACCESS_KEY || 'SEC_MADECC_2026'
  };

  const trimmedInput = commandKey.trim();
  const roleEntry = Object.entries(keys).find(([_, key]) => key === trimmedInput);

  if (roleEntry) {
    console.log(`[AUTH] Success: Match found for ${roleEntry[0]}`);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, role: roleEntry[0] }),
    };
  }

  console.warn(`[AUTH] Failure: No match found for input starting with ${trimmedInput.substring(0, 3)}...`);
  return {
    statusCode: 401,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ success: false, error: "INVALID COMMAND SEQUENCE" }),
  };
};

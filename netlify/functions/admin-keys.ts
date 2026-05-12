import { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  // GET: Fetch keys
  if (event.httpMethod === "GET") {
    const keys = {
      'CEO': process.env.CEO_ACCESS_KEY || 'CEO_MADECC_2026',
      'PROJECT_MANAGER': process.env.PM_ACCESS_KEY || 'PM_MADECC_2026',
      'CONTENT_EDITOR': process.env.CE_ACCESS_KEY || 'CE_MADECC_2026',
      'FINANCIAL_OFFICER': process.env.FO_ACCESS_KEY || 'FO_MADECC_2026',
      'ACCOUNTANT': process.env.ACC_ACCESS_KEY || 'ACC_MADECC_2026',
      'SECRETARY': process.env.SEC_ACCESS_KEY || 'SEC_MADECC_2026'
    };
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(keys),
    };
  }

  // NOTE: On Netlify (Serverless), updates to files don't persist.
  // For a real production app, you should connect this to a database like Firebase.
  if (event.httpMethod === "POST") {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        success: true, 
        message: "Note: Key updates in this demo enviroment are non-persistent without a database connection." 
      }),
    };
  }

  return { statusCode: 405, body: "Method Not Allowed" };
};

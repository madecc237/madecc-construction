import { Handler } from "@netlify/functions";
import nodemailer from "nodemailer";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { code, email, role } = JSON.parse(event.body || "{}");

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
     return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          error: "SMTP Credentials missing in Netlify environment variables.",
          tip: "Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in Netlify settings and REDEPLOY."
        }),
      };
  }

  try {
      const isGmail = SMTP_HOST.includes("gmail.com") || SMTP_USER.includes("@gmail.com");
      const transportConfig: any = isGmail ? {
        service: "gmail",
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      } : {
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT || "587"),
        secure: SMTP_PORT === "465",
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      };

      const transporter = nodemailer.createTransport(transportConfig);

      await transporter.sendMail({
        from: `"MADECC Security" <${SMTP_USER}>`,
        to: email,
        subject: `CEO TERMINAL: ACCESS SEQUENCE #${Math.floor(Math.random() * 9000) + 1000}`,
        html: `
          <div style="font-family: 'Courier New', monospace; max-width: 500px; margin: auto; background: #000; color: #fff; padding: 40px; border: 1px solid #333;">
            <h1 style="color: #ea580c; font-size: 18px; text-transform: uppercase; border-bottom: 1px solid #333; padding-bottom: 10px;">Security Protocol 15-A</h1>
            <p style="color: #666; font-size: 10px; margin-top: 20px;">AUTHORIZATION REQUIRED FOR ${role.toUpperCase()}</p>
            <div style="background: #111; padding: 30px; margin: 30px 0; border: 1px dashed #ea580c; text-align: center;">
              <p style="color: #999; margin: 0; font-size: 11px;">VERIFICATION CODE</p>
              <h2 style="color: #ea580c; font-size: 42px; letter-spacing: 12px; margin: 10px 0;">${code}</h2>
            </div>
            <p style="font-size: 11px; line-height: 1.6; color: #888;">Input this sequence in the terminal to complete verification. (via Netlify)</p>
          </div>
        `,
      });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true }),
    };
  } catch (error: any) {
    console.error("MFA Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to send MFA email via Netlify." }),
    };
  }
};

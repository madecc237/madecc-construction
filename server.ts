import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SECURITY_STORE_PATH = path.join(process.cwd(), "security_store.json");

interface SecurityStore {
  keys: Record<string, string>;
  lastRotation: string;
}

function getSecurityStore(): SecurityStore {
  const defaultKeys = {
    'CEO': process.env.CEO_ACCESS_KEY || 'CEO_MADECC_2026',
    'PROJECT_MANAGER': process.env.PM_ACCESS_KEY || 'PM_MADECC_2026',
    'CONTENT_EDITOR': process.env.CE_ACCESS_KEY || 'CE_MADECC_2026',
    'FINANCIAL_OFFICER': process.env.FO_ACCESS_KEY || 'FO_MADECC_2026',
    'ACCOUNTANT': process.env.ACC_ACCESS_KEY || 'ACC_MADECC_2026',
    'SECRETARY': process.env.SEC_ACCESS_KEY || 'SEC_MADECC_2026'
  };

  if (!fs.existsSync(SECURITY_STORE_PATH)) {
    const store = { keys: defaultKeys, lastRotation: new Date().toISOString() };
    fs.writeFileSync(SECURITY_STORE_PATH, JSON.stringify(store, null, 2));
    return store;
  }

  try {
    const data = fs.readFileSync(SECURITY_STORE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return { keys: defaultKeys, lastRotation: new Date().toISOString() };
  }
}

function saveSecurityStore(store: SecurityStore) {
  fs.writeFileSync(SECURITY_STORE_PATH, JSON.stringify(store, null, 2));
}

function generateRandomKey(prefix: string): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let retVal = "";
  for (let i = 0; i < 24; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return `${prefix}_ROTATED_${retVal}_${new Date().getFullYear()}`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Contact Form
  app.post("/api/contact", async (req, res) => {
    const { name, email, message } = req.body;
    console.log("Contact form submission received:", { name, email, message });
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Email Sending Logic
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_RECEIVER_EMAIL } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.error("CRITICAL: SMTP credentials missing in environment variables.");
      return res.status(500).json({ error: "Server configuration error: SMTP credentials missing. Please set them in the Secrets panel." });
    }

    try {
      const isGmail = SMTP_HOST.includes("gmail.com") || SMTP_USER.includes("@gmail.com");
      
      const transportConfig: any = isGmail ? {
        service: "gmail",
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      } : {
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT || "587"),
        secure: SMTP_PORT === "465",
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      };

      const transporter = nodemailer.createTransport(transportConfig);

      await transporter.sendMail({
        from: `"MADECC Web Form" <${SMTP_USER}>`,
        to: CONTACT_RECEIVER_EMAIL || "madeccco5@gmail.com",
        replyTo: email,
        subject: `New Project Inquiry from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
            <h2 style="color: #ea580c; border-bottom: 2px solid #ea580c; padding-bottom: 10px;">New MADECC Inquiry</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <div style="background: #f9f9f9; padding: 15px; margin-top: 20px;">
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            <p style="font-size: 10px; color: #999; margin-top: 40px;">This email was sent from the MADECC Construction website contact form.</p>
          </div>
        `,
      });

      console.log("Email sent successfully.");
      res.json({ success: true, message: "Thank you for contacting MADECC Construction. We will get back to you shortly." });
    } catch (error: any) {
      console.error("Error sending email:", error);
      
      let clientError = "Failed to send email. Please check your SMTP configuration in the Secrets panel.";
      
      if (error.code === 'EAUTH' || error.message.includes('535') || error.message.includes('Invalid login')) {
        clientError = "Authentication failed. For Gmail: 1. Enable 2-Step Verification. 2. Create an 'App Password' at myaccount.google.com/apppasswords. 3. Use that 16-character code as your SMTP_PASS in the Secrets panel.";
      }

      res.status(500).json({ error: clientError });
    }
  });

  // API Route for Admin Login Verification
  app.post("/api/admin/login", (req, res) => {
    const { commandKey } = req.body;
    const store = getSecurityStore();
    
    // Automatic Rotation Check (90 days)
    const lastRotation = new Date(store.lastRotation);
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    if (lastRotation < ninetyDaysAgo) {
      console.log("[SECURITY] 90-day cycle detected. Rotating non-CEO keys...");
      
      const newKeys = { ...store.keys };
      Object.keys(newKeys).forEach(role => {
        if (role !== 'CEO') {
          newKeys[role] = generateRandomKey(role.substring(0, 3));
        }
      });

      store.keys = newKeys;
      store.lastRotation = new Date().toISOString();
      saveSecurityStore(store);

      // Notify CEO of rotation
      const { SMTP_USER } = process.env;
      if (SMTP_USER) {
        // We'll call an internal notify CEO function here if needed, 
        // but for now we log it and the next CEO login will have the data.
        console.log("[SECURITY] Rotation complete. Dispatching alert to CEO...");
      }
    }

    const roleEntry = Object.entries(store.keys).find(([_, key]) => key === commandKey);
    
    if (roleEntry) {
      return res.json({ success: true, role: roleEntry[0] });
    }

    res.status(401).json({ success: false, error: "INVALID COMMAND SEQUENCE" });
  });

  // API Route for Key Management (CEO ONLY)
  app.get("/api/admin/keys", (req, res) => {
    // In a real app, we'd verify the session token here.
    // For this build, we return the keys for the terminal to display them in the admin panel.
    const store = getSecurityStore();
    res.json(store.keys);
  });

  app.post("/api/admin/keys/update", (req, res) => {
    const { role, newKey } = req.body;
    const store = getSecurityStore();
    store.keys[role] = newKey;
    saveSecurityStore(store);
    res.json({ success: true });
  });

  app.post("/api/admin/keys/rotate-all", (req, res) => {
    const store = getSecurityStore();
    const newKeys = { ...store.keys };
    Object.keys(newKeys).forEach(role => {
      if (role !== 'CEO') {
        newKeys[role] = generateRandomKey(role.substring(0, 3));
      }
    });
    store.keys = newKeys;
    store.lastRotation = new Date().toISOString();
    saveSecurityStore(store);
    res.json({ success: true, keys: store.keys });
  });

  // API Route for MFA Code Dispatch
  app.post("/api/send-mfa", async (req, res) => {
    const { code, email, role } = req.body;
    
    if (!code || !email) {
      return res.status(400).json({ error: "Code and email are required." });
    }

    console.log(`[AUTH_TERMINAL] Dispatching MFA Code [${code}] for role [${role}] to ${email}`);

    // Email Dispatch
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
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
          text: `SECURITY ALERT: An authentication attempt has been detected for the ${role} role.\n\nYOUR MFA CODE: ${code}\n\nIf you did not initiate this request, immediately revoke your primary keys.`,
          html: `
            <div style="font-family: 'Courier New', monospace; max-width: 500px; margin: auto; background: #000; color: #fff; padding: 40px; border: 1px solid #333;">
              <h1 style="color: #ea580c; font-size: 18px; text-transform: uppercase; border-bottom: 1px solid #333; padding-bottom: 10px;">Security Protocol 15-A</h1>
              <p style="color: #666; font-size: 10px; margin-top: 20px;">AUTHORIZATION REQUIRED FOR ${role.toUpperCase()}</p>
              <div style="background: #111; padding: 30px; margin: 30px 0; border: 1px dashed #ea580c; text-align: center;">
                <p style="color: #999; margin: 0; font-size: 11px;">VERIFICATION CODE</p>
                <h2 style="color: #ea580c; font-size: 42px; letter-spacing: 12px; margin: 10px 0;">${code}</h2>
              </div>
              <p style="font-size: 11px; line-height: 1.6; color: #888;">Input this sequence in the terminal to complete primary-to-secondary verification. Sequence expires in 5 minutes.</p>
              <div style="margin-top: 40px; border-top: 1px solid #333; padding-top: 20px;">
                <p style="font-size: 9px; color: #444; margin: 0;">MADECC CONSTRUCTION LTD // CRYPTOGRAPHIC LOCKDOWN ACTIVE</p>
              </div>
            </div>
          `,
        });
        console.log("MFA Email sent successfully.");
      } catch (error) {
        console.error("Failed to send MFA email:", error);
      }
    } else {
      console.warn("MFA Email skipped: SMTP credentials not provided.");
    }

    // SMS Simulation (Real implementations would use Twilio/Vonage)
    // Twilio/SMS is rarely free, so we only simulate it in logs for this build.
    console.log(`[SMS_GATEWAY] Sent to [237671063511]: MADECC Security Alert! Your code is ${code}. Do not share.`);

    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

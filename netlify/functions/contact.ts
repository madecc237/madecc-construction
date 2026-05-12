import { Handler } from "@netlify/functions";
import nodemailer from "nodemailer";

export const handler: Handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { name, email, message } = JSON.parse(event.body || "{}");

    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "All fields are required." }),
      };
    }

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_RECEIVER_EMAIL } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Server configuration error: SMTP credentials missing in Netlify environment variables." }),
      };
    }

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
          <p style="font-size: 10px; color: #999; margin-top: 40px;">This email was sent from the MADECC Construction website contact form via Netlify Functions.</p>
        </div>
      `,
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        success: true, 
        message: "Thank you for contacting MADECC Construction. We will get back to you shortly." 
      }),
    };
  } catch (error: any) {
    console.error("Error sending email:", error);
    
    let clientError = "Failed to send email. Please check your SMTP configuration in Netlify.";
    
    if (error.code === 'EAUTH' || error.message.includes('535') || error.message.includes('Invalid login')) {
      clientError = "Authentication failed. For Gmail: Enable App Passwords.";
    }

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: clientError }),
    };
  }
};

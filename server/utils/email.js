import nodemailer from "nodemailer";

/**
 * Sends a workshop registration confirmation email.
 * If SMTP environment variables are not present, it simulates the process.
 */
export async function sendConfirmationEmail(participant) {
  const { name, email, workshop, referenceId, organization } = participant;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const sendFrom = process.env.SMTP_FROM || "workshops@organization.edu";

  const emailSubject = `Workshop Registration Confirmed: ${workshop}`;
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid #3b82f6; padding-bottom: 16px;">
        <h1 style="color: #1e3a8a; margin: 0; font-size: 24px; font-weight: 700;">Workshop Confirmation</h1>
        <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Academic & Professional Development</p>
      </div>
      
      <p style="color: #334155; font-size: 16px; line-height: 1.5;">Dear <strong>${name}</strong>,</p>
      <p style="color: #334155; font-size: 15px; line-height: 1.5;">Congratulations! Your registration for the upcoming workshop has been successfully confirmed. Below are your registration details:</p>
      
      <div style="background-color: #f8fafc; border-radius: 6px; padding: 16px; margin: 20px 0; border-left: 4px solid #3b82f6;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500; width: 140px;">Reference ID:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 700; font-family: monospace; font-size: 16px;">${referenceId}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Workshop Name:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${workshop}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Participant Name:</td>
            <td style="padding: 6px 0; color: #0f172a;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Email & Contact:</td>
            <td style="padding: 6px 0; color: #0f172a;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">College/Organization:</td>
            <td style="padding: 6px 0; color: #0f172a;">${organization}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Status:</td>
            <td style="padding: 6px 0;"><span style="background-color: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: 600;">CONFIRMED</span></td>
          </tr>
        </table>
      </div>

      <p style="color: #334155; font-size: 14px; line-height: 1.5; margin-top: 20px;">
        Please keep this confirmation number handy for event attendance check-ins. If you have any questions or need to cancel/change your registration, please contact our support team.
      </p>
      
      <div style="text-align: center; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 20px; color: #94a3b8; font-size: 12px;">
        <p style="margin: 0;">This is an automated confirmation message. Do not reply directly to this mail.</p>
        <p style="margin: 4px 0 0 0;">Workshop Coordination Committee &copy; 2026</p>
      </div>
    </div>
  `;

  // Check if SMTP is configured
  if (smtpHost && smtpUser && smtpPass) {
    try {
      console.log(`✉️ Attempting to send real SMTP confirmation to ${email}...`);
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // Use SSL/TLS for 465, STARTTLS otherwise
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: sendFrom,
        to: email,
        subject: emailSubject,
        html: htmlContent,
      });

      console.log(`✅ Mail sent successfully! MessageId: ${info.messageId}`);
      return {
        sent: true,
        status: `Mail delivered to ${email}`,
        recipient: email,
      };
    } catch (err) {
      console.error("❌ SMTP Error occurred:", err);
      return {
        sent: false,
        status: `Failed to deliver email: ${err.message || err}`,
        recipient: email,
      };
    }
  } else {
    // Local / Dev Fallback simulation
    console.log("\n==================================================");
    console.log("📨 SIMULATED EMAIL TRANSMISSION");
    console.log(`To: ${email}`);
    console.log(`From: ${sendFrom}`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`Reference ID: ${referenceId}`);
    console.log("--------------------------------------------------");
    console.log(`Dear ${name}, your seat in the "${workshop}" is confirmed!`);
    console.log("==================================================\n");

    return {
      sent: true,
      status: "Dev Sandbox Simulation: Email successfully logged to system console.",
      recipient: email,
      bodyPreview: `Reference ID: ${referenceId}, Workshop: ${workshop}`,
    };
  }
}

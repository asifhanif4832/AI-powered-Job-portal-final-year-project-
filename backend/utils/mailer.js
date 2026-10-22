import nodemailer from "nodemailer";

const normalizeAppPassword = (pass) => (pass ? String(pass).replace(/\s/g, "") : "");

export function createMailer() {
  const user = (process.env.SMTP_USER || process.env.GMAIL_USER || "").trim();
  const pass = normalizeAppPassword(process.env.SMTP_PASS);

  if (!user || !pass) {
    throw new Error("SMTP_USER and SMTP_PASS must be set in environment");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user, pass },
  });
}

export async function sendSignupOtp(to, otp) {
  const transporter = createMailer();
  const from = process.env.SMTP_FROM || `"Job Portal" <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from,
    to,
    subject: "Job Portal — verify your email",
    text: `Your signup verification code is ${otp}. It expires in 10 minutes. If you did not sign up, ignore this email.`,
    html: `
      <p>Your email verification code is:</p>
      <p style="font-size:24px;font-weight:bold;letter-spacing:4px;">${otp}</p>
      <p>This code expires in <strong>10 minutes</strong>.</p>
      <p>If you did not create an account, you can ignore this email.</p>
    `,
  });
}

export async function sendPasswordResetOtp(to, otp) {
  const transporter = createMailer();
  const from = process.env.SMTP_FROM || `"Job Portal" <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from,
    to,
    subject: "Job Portal — password reset OTP",
    text: `Your password reset OTP is ${otp}. It expires in 10 minutes. If you did not request this, ignore this email.`,
    html: `
      <p>Your password reset OTP is:</p>
      <p style="font-size:24px;font-weight:bold;letter-spacing:4px;">${otp}</p>
      <p>This code expires in <strong>10 minutes</strong>.</p>
      <p>If you did not request a password reset, you can ignore this email.</p>
    `,
  });
}

export async function sendInterviewScheduledEmail(to, { candidateName, jobTitle, companyName, interviewAt, notes }) {
  const transporter = createMailer();
  const from = process.env.SMTP_FROM || `"Job Portal" <${process.env.SMTP_USER}>`;
  const formatted = interviewAt
    ? new Date(interviewAt).toLocaleString()
    : "To be announced";

  await transporter.sendMail({
    from,
    to,
    subject: "Job Portal — interview scheduled",
    text: `Hi ${candidateName || "Candidate"}, your interview for ${jobTitle} at ${companyName || "the company"} is scheduled on ${formatted}.${notes ? ` Notes: ${notes}` : ""}`,
    html: `
      <p>Hi <strong>${candidateName || "Candidate"}</strong>,</p>
      <p>Your interview has been scheduled.</p>
      <ul>
        <li><strong>Role:</strong> ${jobTitle || "-"}</li>
        <li><strong>Company:</strong> ${companyName || "-"}</li>
        <li><strong>Date & time:</strong> ${formatted}</li>
      </ul>
      ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
      <p>Please stay active on Job Portal for updates.</p>
    `,
  });
}

console.log("TEST EMAIL SCRIPT STARTED");

import { Resend } from "resend";
import "dotenv/config";

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: process.env.EMAIL_TEST_TO!,
    subject: "The Swat Loom - Test Email",
    html: `
      <h1>Welcome to The Swat Loom!</h1>
      <p>Your email integration is working.</p>
      <p>This is a test order confirmation.</p>
    `,
  });

  if (error) {
    console.error("Email failed:", error);
    return;
  }

  console.log("Email sent successfully:", data);
}

testEmail();

console.log("TEST EMAIL SCRIPT FINISHED");
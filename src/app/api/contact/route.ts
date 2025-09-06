import { ContactFormEmail } from "@/emails/contact-form-email";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { env } from "~/env";

function getResend(): Resend | null {
  try {
    if (!env.RESEND_API_KEY) return null;
    return new Resend(env.RESEND_API_KEY);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, subject, category, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const resend = getResend();
    const receiver: string | undefined = process.env.CONTACT_FORM_RECEIVER_EMAIL;
    if (!resend || !env.EMAIL_FROM || !receiver) {
      console.warn("[contact] Email provider not configured. Skipping send.");
      return NextResponse.json({ message: "Contact form is not configured." }, { status: 503 });
    }

    const { error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: receiver, // The email address that will receive the form submissions
      subject: `New Contact Form Submission: ${subject}`,
      replyTo: email,
      react: ContactFormEmail({ name, email, subject, category, message }),
    });

    if (error) {
      console.error("Error sending email:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ message: "Email sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in contact API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

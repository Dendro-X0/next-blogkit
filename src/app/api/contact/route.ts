import { ContactFormEmail } from "@/emails/contact-form-email";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, subject, category, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>", // This needs to be a verified domain in Resend
      to: process.env.CONTACT_FORM_RECEIVER_EMAIL || "", // The email address that will receive the form submissions
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

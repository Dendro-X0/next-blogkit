import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ContactFormEmailProps {
  name: string;
  email: string;
  subject: string;
  category?: string;
  message: string;
}

export const ContactFormEmail = ({
  name,
  email,
  subject,
  category,
  message,
}: ContactFormEmailProps) => (
  <Html>
    <Head />
    <Preview>New message from your contact form</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>New Contact Form Submission</Heading>
        <Text style={paragraph}>
          You&apos;ve received a new message from your blog&apos;s contact form.
        </Text>
        <Hr style={hr} />
        <Section>
          <Text>
            <strong>From:</strong> {name}
          </Text>
          <Text>
            <strong>Email:</strong> {email}
          </Text>
          <Text>
            <strong>Subject:</strong> {subject}
          </Text>
          {category && (
            <Text>
              <strong>Category:</strong> {category}
            </Text>
          )}
          <Heading as="h2" style={subHeading}>
            Message:
          </Heading>
          <Text style={messageBox}>{message}</Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "Helvetica,Arial,sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  border: "1px solid #f0f0f0",
  borderRadius: "4px",
};

const heading = {
  fontSize: "28px",
  fontWeight: "bold",
  marginTop: "0",
  textAlign: "center" as const,
  color: "#2f3d4a",
};

const subHeading = {
  fontSize: "18px",
  fontWeight: "bold",
  marginTop: "20px",
  color: "#2f3d4a",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "center" as const,
  color: "#5f6f7d",
};

const messageBox = {
  padding: "12px",
  backgroundColor: "#f0f2f5",
  borderRadius: "4px",
  border: "1px solid #e0e0e0",
  fontSize: "14px",
  lineHeight: "20px",
  color: "#333",
};

const hr = {
  borderColor: "#f0f0f0",
  marginTop: "20px",
};

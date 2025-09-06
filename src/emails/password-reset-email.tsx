import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface PasswordResetEmailProps {
  name: string;
  url: string;
}

export const PasswordResetEmail = ({ name, url }: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Reset Your Password</Heading>
        <Text style={paragraph}>Hi {name},</Text>
        <Text style={paragraph}>
          Someone recently requested a password change for your account. If this was you, you can
          set a new password here:
        </Text>
        <Section style={btnContainer}>
          <Button style={button} href={url}>
            Reset Password
          </Button>
        </Section>
        <Text style={paragraph}>
          If you don&apos;t want to change your password or didn&apos;t request this, just ignore
          and delete this message.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>This email was sent from your blog boilerplate.</Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#ffffff",
  fontFamily: "sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#333",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#555",
};

const btnContainer = {
  textAlign: "center" as const,
  margin: "20px 0",
};

const button = {
  backgroundColor: "#007bff",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  borderRadius: "5px",
  padding: "12px 20px",
};

const hr = {
  borderColor: "#cccccc",
  margin: "20px 0",
};

const footer = {
  color: "#888888",
  fontSize: "12px",
};

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

interface VerificationEmailProps {
  name: string;
  url: string;
}

export const VerificationEmail = ({ name, url }: VerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Verify your email address</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Verify Your Email</Heading>
        <Text style={paragraph}>Hi {name},</Text>
        <Text style={paragraph}>
          Thanks for signing up! Please verify your email address by clicking the button below:
        </Text>
        <Section style={btnContainer}>
          <Button style={button} href={url}>
            Verify Email
          </Button>
        </Section>
        <Text style={paragraph}>
          If you did not sign up for this account, you can safely ignore this email.
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

// src/api/send-email.ts
// Minimal request/response type definitions to avoid requiring '@vercel/node'
type VercelRequest = {
  method?: string;
  body?: any;
  headers?: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): VercelResponse;
  json(body: any): void;
  end(body?: any): void;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow cross-origin requests (you can specify a specific domain instead of '*')
  res.setHeader('Access-Control-Allow-Origin', '*');  // For development
  // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080'); // Use this to restrict to specific domains

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Your email sending logic here
  try {
    // Your email sending logic goes here, for example:
    const { to, subject, htmlBody } = req.body;

    // Assuming you have a function to send the email
    await sendEmail(to, subject, htmlBody);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
}

// Dummy function to simulate sending email
async function sendEmail(to: string, subject: string, htmlBody: string) {
  // Integrate your email service here (e.g., nodemailer, SendGrid, etc.)
  console.log(`Sending email to ${to} with subject: ${subject}`);
  // Logic for sending the email
}

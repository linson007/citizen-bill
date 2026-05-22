type EmailNotification = {
  to?: string | null;
  subject: string;
  text: string;
};

export async function sendEmailNotification(message: EmailNotification) {
  if (!message.to) {
    return;
  }

  // Provider integration point. In development we keep this observable without
  // adding a paid email dependency.
  if (!process.env.EMAIL_FROM) {
    console.info("[email:dev]", {
      to: message.to,
      subject: message.subject,
      text: message.text,
    });
    return;
  }

  console.info("[email:queued]", {
    from: process.env.EMAIL_FROM,
    to: message.to,
    subject: message.subject,
  });
}

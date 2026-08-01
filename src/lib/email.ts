type EmailNotification = {
  to?: string | null;
  subject: string;
  text: string;
};

export async function sendEmailNotification(message: EmailNotification) {
  if (!message.to) {
    return;
  }

  // Email delivery is not wired to a provider yet. EMAIL_FROM only marks that
  // a production sender identity is configured; events are logged for now.
  if (!process.env.EMAIL_FROM) {
    console.info("[email:dev]", {
      to: message.to,
      subject: message.subject,
      text: message.text,
    });
    return;
  }

  console.info("[email:queued-not-sent]", {
    from: process.env.EMAIL_FROM,
    to: message.to,
    subject: message.subject,
  });
}

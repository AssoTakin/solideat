import sgMail from '@sendgrid/mail';

export class EmailService {
  private fromEmail: string;

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (apiKey && apiKey !== 'SG...') {
      sgMail.setApiKey(apiKey);
    } else {
      console.warn('⚠️  SENDGRID_API_KEY non configurée. Les emails ne seront pas envoyés.');
    }
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@solideat.fr';
  }

  /**
   * Envoie un email de vérification
   */
  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey || apiKey === 'SG...') {
      console.log('📧 [DEV] Email de vérification (non envoyé):', { to, token });
      return;
    }

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/verify-email?token=${token}`;

    const msg = {
      to,
      from: this.fromEmail,
      subject: 'Vérifiez votre email - SOLID\'EAT',
      html: `
        <h1>Bienvenue sur SOLID'EAT !</h1>
        <p>Merci de vous être inscrit. Veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous :</p>
        <p><a href="${verificationUrl}">Vérifier mon email</a></p>
        <p>Ce lien est valide pendant 24 heures.</p>
        <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
      `,
      text: `Bienvenue sur SOLID'EAT ! Vérifiez votre email : ${verificationUrl}`,
    };

    try {
      await sgMail.send(msg);
      console.log('✅ Email de vérification envoyé à', to);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw new Error('Impossible d\'envoyer l\'email de vérification');
    }
  }

  /**
   * Renvoie un email de vérification
   */
  async resendVerificationEmail(to: string, token: string): Promise<void> {
    return this.sendVerificationEmail(to, token);
  }
}

export const emailService = new EmailService();

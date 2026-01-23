import sgMail from '@sendgrid/mail';

export class EmailService {
  private fromEmail: string;

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (apiKey && apiKey !== 'SG...') {
      sgMail.setApiKey(apiKey);
    }
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@solideat.fr';
  }

  /**
   * Envoie un email de vérification
   */
  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey || apiKey === 'SG...') {
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
    } catch (error) {
      throw new Error('Impossible d\'envoyer l\'email de vérification');
    }
  }

  /**
   * Renvoie un email de vérification
   */
  async resendVerificationEmail(to: string, token: string): Promise<void> {
    return this.sendVerificationEmail(to, token);
  }

  /**
   * Envoie un email pour les bonus donateurs reçus
   */
  async sendBonusDonorEmail(to: string, count: number): Promise<void> {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey || apiKey === 'SG...') {
      return;
    }

    const msg = {
      to,
      from: this.fromEmail,
      subject: `Vous avez reçu ${count} bonus donateur${count > 1 ? 's' : ''} - SOLID'EAT`,
      html: `
        <h1>Félicitations !</h1>
        <p>Vous avez reçu ${count} bonus donateur${count > 1 ? 's' : ''} pour votre contribution à la lutte contre le gaspillage alimentaire.</p>
        <p>Ces bonus sont valables pendant 2 semaines. Utilisez-les pour réserver des repas sans en proposer en retour.</p>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard">Voir mes bonus</a></p>
      `,
      text: `Vous avez reçu ${count} bonus donateur${count > 1 ? 's' : ''}. Valables 2 semaines.`,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      // Erreur silencieuse
    }
  }

  /**
   * Envoie un email pour un bonus donateur reçu par transfert
   */
  async sendBonusDonorReceivedEmail(to: string, senderName: string): Promise<void> {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey || apiKey === 'SG...') {
      return;
    }

    const msg = {
      to,
      from: this.fromEmail,
      subject: 'Vous avez reçu un bonus donateur - SOLID\'EAT',
      html: `
        <h1>Bonus donateur reçu !</h1>
        <p>${senderName} vous a transféré un bonus donateur.</p>
        <p>Ce bonus est valable pendant 2 semaines. Utilisez-le pour réserver des repas sans en proposer en retour.</p>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard">Voir mes bonus</a></p>
      `,
      text: `${senderName} vous a transféré un bonus donateur. Valable 2 semaines.`,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      // Erreur silencieuse
    }
  }

  /**
   * Envoie un email pour un bonus donateur expirant
   */
  async sendBonusDonorExpiringEmail(to: string, daysLeft: number): Promise<void> {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey || apiKey === 'SG...') {
      return;
    }

    const msg = {
      to,
      from: this.fromEmail,
      subject: `Votre bonus donateur expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''} - SOLID'EAT`,
      html: `
        <h1>Rappel : Bonus donateur expirant</h1>
        <p>Votre bonus donateur expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}.</p>
        <p>Utilisez-le rapidement pour réserver un repas sans en proposer en retour !</p>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard">Voir mes bonus</a></p>
      `,
      text: `Votre bonus donateur expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}. Utilisez-le rapidement !`,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      // Erreur silencieuse
    }
  }

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey || apiKey === 'SG...') {
      console.log(`[DEV] Email de réinitialisation pour ${to}: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/reset-password?token=${token}`);
      return;
    }

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/reset-password?token=${token}`;

    const msg = {
      to,
      from: this.fromEmail,
      subject: 'Réinitialisation de votre mot de passe - SOLID\'EAT',
      html: `
        <h1>Réinitialisation de votre mot de passe</h1>
        <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous :</p>
        <p><a href="${resetUrl}">Réinitialiser mon mot de passe</a></p>
        <p>Ce lien est valide pendant 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe ne sera pas modifié.</p>
      `,
      text: `Réinitialisation de votre mot de passe : ${resetUrl}`,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      throw new Error('Impossible d\'envoyer l\'email de réinitialisation');
    }
  }

  /**
   * Envoie un email pour un badge obtenu
   */
  async sendBadgeEarnedEmail(to: string, badgeName: string): Promise<void> {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey || apiKey === 'SG...') {
      return;
    }

    const msg = {
      to,
      from: this.fromEmail,
      subject: `Nouveau badge obtenu : ${badgeName} - SOLID'EAT`,
      html: `
        <h1>Félicitations !</h1>
        <p>Vous avez obtenu le badge "${badgeName}" !</p>
        <p>Continuez ainsi pour obtenir d'autres badges.</p>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard">Voir mes badges</a></p>
      `,
      text: `Vous avez obtenu le badge "${badgeName}" !`,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      // Erreur silencieuse
    }
  }

  /**
   * Envoie un email pour un abonnement annulé
   */
  async sendSubscriptionCancelledEmail(to: string, endDate: Date | null): Promise<void> {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey || apiKey === 'SG...') {
      return;
    }

    const msg = {
      to,
      from: this.fromEmail,
      subject: 'Abonnement annulé - SOLID\'EAT',
      html: `
        <h1>Abonnement annulé</h1>
        <p>Votre abonnement premium a été annulé.</p>
        <p>Il restera actif jusqu'au ${endDate ? endDate.toLocaleDateString('fr-FR') : 'fin de la période'}.</p>
        <p>Vous serez rétrogradé en membre gratuit après cette date.</p>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscriptions">Gérer mon abonnement</a></p>
      `,
      text: `Votre abonnement premium a été annulé. Il restera actif jusqu'au ${endDate ? endDate.toLocaleDateString('fr-FR') : 'fin de la période'}.`,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      // Erreur silencieuse
    }
  }

  /**
   * Envoie un email pour un abonnement expirant
   */
  async sendSubscriptionExpiringEmail(to: string, daysLeft: number): Promise<void> {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey || apiKey === 'SG...') {
      return;
    }

    const msg = {
      to,
      from: this.fromEmail,
      subject: `Votre abonnement expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''} - SOLID'EAT`,
      html: `
        <h1>Rappel : Abonnement expirant</h1>
        <p>Votre abonnement premium expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}.</p>
        <p>Il sera renouvelé automatiquement si votre carte de paiement est valide.</p>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscriptions">Gérer mon abonnement</a></p>
      `,
      text: `Votre abonnement premium expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}. Il sera renouvelé automatiquement si votre carte est valide.`,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      // Erreur silencieuse
    }
  }

  /**
   * Envoie un email pour un abonnement expiré
   */
  async sendSubscriptionExpiredEmail(to: string): Promise<void> {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey || apiKey === 'SG...') {
      return;
    }

    const msg = {
      to,
      from: this.fromEmail,
      subject: 'Votre abonnement a expiré - SOLID\'EAT',
      html: `
        <h1>Abonnement expiré</h1>
        <p>Votre abonnement premium a expiré.</p>
        <p>Vous êtes maintenant membre gratuit. Vous pouvez souscrire à un nouvel abonnement à tout moment.</p>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscriptions">Souscrire à un abonnement</a></p>
      `,
      text: 'Votre abonnement premium a expiré. Vous êtes maintenant membre gratuit.',
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      // Erreur silencieuse
    }
  }
}

export const emailService = new EmailService();

import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@solideat.fr';

    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });
    } else {
      console.warn("⚠️ SMTP non configuré. L'envoi d'e-mails réels sera désactivé.");
    }
  }

  /**
   * Envoie un e-mail via le transporteur configuré
   */
  private async sendMail(to: string, subject: string, html: string, text: string, silent = true): Promise<void> {
    if (!this.transporter) {
      console.warn(`[Email non envoyé - SMTP non configuré] À : ${to} | Sujet : ${subject}`);
      if (!silent) {
        throw new Error("Service d'envoi d'e-mail non configuré (SMTP_HOST, SMTP_USER ou SMTP_PASS manquant dans Railway).");
      }
      return;
    }

    const mailOptions = {
      from: this.fromEmail,
      to,
      subject,
      text,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error: any) {
      const errorMsg = `Échec de l'envoi de l'e-mail à ${to} : ${error.message || error}`;
      console.error(errorMsg);
      if (!silent) {
        throw new Error(errorMsg);
      }
    }
  }

  /**
   * Envoie un email de vérification
   */
  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?token=${token}`;

    const subject = 'Vérifiez votre email - SOLID\'EAT';
    const html = `
      <h1>Bienvenue sur SOLID'EAT !</h1>
      <p>Merci de vous être inscrit. Veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous :</p>
      <p><a href="${verificationUrl}">Vérifier mon email</a></p>
      <p>Ce lien est valide pendant 24 heures.</p>
      <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
    `;
    const text = `Bienvenue sur SOLID'EAT ! Vérifiez votre email : ${verificationUrl}`;

    await this.sendMail(to, subject, html, text, false);
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
    const subject = `Vous avez reçu ${count} bonus donateur${count > 1 ? 's' : ''} - SOLID'EAT`;
    const html = `
      <h1>Félicitations !</h1>
      <p>Vous avez reçu ${count} bonus donateur${count > 1 ? 's' : ''} pour votre contribution à la lutte contre le gaspillage alimentaire.</p>
      <p>Ces bonus sont valables pendant 2 semaines. Utilisez-les pour réserver des repas sans en proposer en retour.</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard">Voir mes bonus</a></p>
    `;
    const text = `Vous avez reçu ${count} bonus donateur${count > 1 ? 's' : ''}. Valables 2 semaines.`;

    await this.sendMail(to, subject, html, text, true);
  }

  /**
   * Envoie un email pour un bonus donateur reçu par transfert
   */
  async sendBonusDonorReceivedEmail(to: string, senderName: string): Promise<void> {
    const subject = 'Vous avez reçu un bonus donateur - SOLID\'EAT';
    const html = `
      <h1>Bonus donateur reçu !</h1>
      <p>${senderName} vous a transféré un bonus donateur.</p>
      <p>Ce bonus est valable pendant 2 semaines. Utilisez-le pour réserver des repas sans en proposer en retour.</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard">Voir mes bonus</a></p>
    `;
    const text = `${senderName} vous a transféré un bonus donateur. Valable 2 semaines.`;

    await this.sendMail(to, subject, html, text, true);
  }

  /**
   * Envoie un email pour un bonus donateur expirant
   */
  async sendBonusDonorExpiringEmail(to: string, daysLeft: number): Promise<void> {
    const subject = `Votre bonus donateur expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''} - SOLID'EAT`;
    const html = `
      <h1>Rappel : Bonus donateur expirant</h1>
      <p>Votre bonus donateur expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}.</p>
      <p>Utilisez-le rapidement pour réserver un repas sans en proposer en retour !</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard">Voir mes bonus</a></p>
    `;
    const text = `Votre bonus donateur expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}. Utilisez-le rapidement !`;

    await this.sendMail(to, subject, html, text, true);
  }

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/reset-password?token=${token}`;

    const subject = 'Réinitialisation de votre mot de passe - SOLID\'EAT';
    const html = `
      <h1>Réinitialisation de votre mot de passe</h1>
      <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous :</p>
      <p><a href="${resetUrl}">Réinitialiser mon mot de passe</a></p>
      <p>Ce lien est valide pendant 1 heure.</p>
      <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe ne sera pas modifié.</p>
    `;
    const text = `Réinitialisation de votre mot de passe : ${resetUrl}`;

    await this.sendMail(to, subject, html, text, false);
  }

  /**
   * Envoie un email pour un badge obtenu
   */
  async sendBadgeEarnedEmail(to: string, badgeName: string): Promise<void> {
    const subject = `Nouveau badge obtenu : ${badgeName} - SOLID'EAT`;
    const html = `
      <h1>Félicitations !</h1>
      <p>Vous avez obtenu le badge "${badgeName}" !</p>
      <p>Continuez ainsi pour obtenir d'autres badges.</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard">Voir mes badges</a></p>
    `;
    const text = `Vous avez obtenu le badge "${badgeName}" !`;

    await this.sendMail(to, subject, html, text, true);
  }

  /**
   * Envoie un email pour un abonnement annulé
   */
  async sendSubscriptionCancelledEmail(to: string, endDate: Date | null): Promise<void> {
    const dateStr = endDate ? endDate.toLocaleDateString('fr-FR') : 'fin de la période';
    const subject = 'Abonnement annulé - SOLID\'EAT';
    const html = `
      <h1>Abonnement annulé</h1>
      <p>Votre abonnement premium a été annulé.</p>
      <p>Il restera actif jusqu'au ${dateStr}.</p>
      <p>Vous serez rétrogradé en membre gratuit après cette date.</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscriptions">Gérer mon abonnement</a></p>
    `;
    const text = `Votre abonnement premium a été annulé. Il restera actif jusqu'au ${dateStr}.`;

    await this.sendMail(to, subject, html, text, true);
  }

  /**
   * Envoie un email pour un abonnement expirant
   */
  async sendSubscriptionExpiringEmail(to: string, daysLeft: number): Promise<void> {
    const subject = `Votre abonnement expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''} - SOLID'EAT`;
    const html = `
      <h1>Rappel : Abonnement expirant</h1>
      <p>Votre abonnement premium expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}.</p>
      <p>Il sera renouvelé automatiquement si votre carte de paiement est valide.</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscriptions">Gérer mon abonnement</a></p>
    `;
    const text = `Votre abonnement premium expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}. Il sera renouvelé automatiquement si votre carte est valide.`;

    await this.sendMail(to, subject, html, text, true);
  }

  /**
   * Envoie un email pour un abonnement expiré
   */
  async sendSubscriptionExpiredEmail(to: string): Promise<void> {
    const subject = 'Votre abonnement a expiré - SOLID\'EAT';
    const html = `
      <h1>Abonnement expiré</h1>
      <p>Votre abonnement premium a expiré.</p>
      <p>Vous êtes maintenant membre gratuit. Vous pouvez souscrire à un nouvel abonnement à tout moment.</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscriptions">Souscrire à un abonnement</a></p>
    `;
    const text = 'Votre abonnement premium a expiré. Vous êtes maintenant membre gratuit.';

    await this.sendMail(to, subject, html, text, true);
  }

  /**
   * Envoie un email pour un abonnement créé
   */
  async sendSubscriptionCreatedEmail(to: string, planType: string): Promise<void> {
    const planName = planType.replace('PREMIUM_', '').toLowerCase();
    const planDisplayName = {
      weekly: 'Hebdomadaire',
      monthly: 'Mensuel',
      yearly: 'Annuel',
    }[planName] || planName;

    const subject = 'Abonnement créé avec succès - SOLID\'EAT';
    const html = `
      <h1>Bienvenue dans Premium !</h1>
      <p>Votre abonnement premium ${planDisplayName} a été activé avec succès.</p>
      <p>Vous avez maintenant accès à toutes les fonctionnalités premium :</p>
      <ul>
        <li>3 repas réservés par semaine</li>
        <li>3 repas proposés par semaine</li>
        <li>Accès à "Sauvez-les"</li>
        <li>Filtres de recherche avancés</li>
        <li>Statistiques d'impact environnemental</li>
        <li>Masquer votre numéro de téléphone</li>
      </ul>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard">Accéder à mon tableau de bord</a></p>
    `;
    const text = `Votre abonnement premium ${planDisplayName} a été activé avec succès.`;

    await this.sendMail(to, subject, html, text, true);
  }

  /**
   * Envoie un email pour un échec de paiement
   */
  async sendSubscriptionPaymentFailedEmail(to: string): Promise<void> {
    const subject = 'Échec de paiement - SOLID\'EAT';
    const html = `
      <h1>Échec de paiement</h1>
      <p>Le paiement de votre abonnement premium a échoué.</p>
      <p>Veuillez mettre à jour votre méthode de paiement pour continuer à profiter de votre abonnement premium.</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscriptions">Mettre à jour ma méthode de paiement</a></p>
      <p>Si vous ne mettez pas à jour votre méthode de paiement, votre abonnement sera suspendu.</p>
    `;
    const text = 'Le paiement de votre abonnement premium a échoué. Veuillez mettre à jour votre méthode de paiement.';

    await this.sendMail(to, subject, html, text, true);
  }
}

export const emailService = new EmailService();

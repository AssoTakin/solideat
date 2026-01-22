import twilio from 'twilio';

export class SmsService {
  private client: twilio.Twilio | null = null;
  private phoneNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER || '';

    if (accountSid && authToken && accountSid !== 'AC...' && authToken !== '...') {
      this.client = twilio(accountSid, authToken);
    } else {
      console.warn('⚠️  Twilio non configuré. Les SMS ne seront pas envoyés.');
    }
  }

  /**
   * Génère un code de vérification à 6 chiffres
   */
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Envoie un SMS avec un code de vérification
   */
  async sendVerificationSMS(to: string, code: string): Promise<void> {
    if (!this.client || !this.phoneNumber) {
      console.log('📱 [DEV] SMS de vérification (non envoyé):', { to, code });
      return;
    }

    try {
      await this.client.messages.create({
        body: `Votre code de vérification SOLID'EAT : ${code}. Valide 10 minutes.`,
        from: this.phoneNumber,
        to,
      });
      console.log('✅ SMS de vérification envoyé à', to);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du SMS:', error);
      throw new Error('Impossible d\'envoyer le SMS de vérification');
    }
  }

  /**
   * Renvoie un SMS de vérification
   */
  async resendVerificationSMS(to: string, code: string): Promise<void> {
    return this.sendVerificationSMS(to, code);
  }
}

export const smsService = new SmsService();

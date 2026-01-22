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
      return;
    }

    try {
      await this.client.messages.create({
        body: `Votre code de vérification SOLID'EAT : ${code}. Valide 10 minutes.`,
        from: this.phoneNumber,
        to,
      });
    } catch (error) {
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

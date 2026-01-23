import { useState } from 'react';
import { bonusDonorService, BonusDonor } from '../services/bonus-donor.service';

const colors = {
  primary: '#FF6B35',
  success: '#2ECC71',
  error: '#E74C3C',
  textPrimary: '#2C3E50',
  textSecondary: '#7F8C8D',
  backgroundWhite: '#FFFFFF',
  premium: '#9B59B6',
};

interface BonusDonorTransferProps {
  bonus: BonusDonor;
  onTransferComplete: () => void;
}

export default function BonusDonorTransfer({ bonus, onTransferComplete }: BonusDonorTransferProps) {
  const [recipientUsername, setRecipientUsername] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleTransfer = async () => {
    if (!recipientUsername.trim()) {
      setError('Veuillez entrer le pseudo du bénéficiaire');
      return;
    }

    setTransferring(true);
    setError(null);

    try {
      const response = await bonusDonorService.transferBonus(bonus.id, recipientUsername.trim());
      if (response.success) {
        setShowModal(false);
        setRecipientUsername('');
        onTransferComplete();
        alert('Bonus donateur transféré avec succès !');
      } else {
        setError(response.error || 'Erreur lors du transfert');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du transfert');
    } finally {
      setTransferring(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          padding: '6px 12px',
          backgroundColor: colors.premium,
          color: colors.backgroundWhite,
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        Transférer
      </button>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
          onClick={() => !transferring && setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: colors.backgroundWhite,
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '16px' }}>
              Transférer un bonus donateur
            </h2>
            <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '16px' }}>
              Entrez le pseudo du membre à qui vous souhaitez transférer ce bonus donateur.
            </p>

            {error && (
              <div
                style={{
                  backgroundColor: '#FEE',
                  color: colors.error,
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '14px',
                }}
              >
                {error}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: colors.textPrimary,
                  marginBottom: '8px',
                }}
              >
                Pseudo du bénéficiaire
              </label>
              <input
                type="text"
                value={recipientUsername}
                onChange={(e) => setRecipientUsername(e.target.value)}
                placeholder="ex: johndoe"
                disabled={transferring}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${colors.textSecondary}40`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleTransfer}
                disabled={transferring || !recipientUsername.trim()}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: transferring ? colors.textSecondary : colors.premium,
                  color: colors.backgroundWhite,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: transferring || !recipientUsername.trim() ? 'not-allowed' : 'pointer',
                  opacity: transferring || !recipientUsername.trim() ? 0.6 : 1,
                }}
              >
                {transferring ? 'Transfert...' : 'Confirmer le transfert'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                disabled={transferring}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: colors.textSecondary + '20',
                  color: colors.textPrimary,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: transferring ? 'not-allowed' : 'pointer',
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

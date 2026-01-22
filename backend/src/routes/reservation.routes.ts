import { Router } from 'express';
import { reservationController } from '../controllers/reservation.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createReservationSchema, cancelReservationSchema } from '../validators/reservation.validator';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Création d'une réservation
router.post('/', validate(createReservationSchema), reservationController.createReservation.bind(reservationController));

// Liste des réservations de l'utilisateur
router.get('/', reservationController.getMyReservations.bind(reservationController));

// Annulation d'une réservation
router.delete('/:id', validate(cancelReservationSchema), reservationController.cancelReservation.bind(reservationController));

// Marquer comme récupéré
router.put('/:id/pickup', reservationController.markAsPickedUp.bind(reservationController));

// Signaler non récupéré
router.post('/:id/report-not-picked-up', reservationController.reportNotPickedUp.bind(reservationController));

export default router;

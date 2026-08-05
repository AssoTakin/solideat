import { Router } from 'express';
import prisma from '../config/database';

const router = Router();

// Temporary cleanup route - REMOVE AFTER USE
router.post('/cleanup-test-data', async (_req, res) => {
  try {
    // Test data IDs
    const sellerId = '6b03d1fe-b5e6-476e-9b7c-58985b473c14';
    const buyerId = '609fb025-ae58-4b2d-819e-322eba672716';
    const mealId = '2aadcfbe-5e13-43a4-bce7-b421f6aeb77b';
    const reservationId = 'fec1548e-fd32-449a-a03c-21fca7bf2853';
    
    // Delete in order to respect foreign keys
    const deletedReservation = await prisma.reservation.deleteMany({
      where: { id: reservationId },
    });
    
    const deletedMeal = await prisma.meal.deleteMany({
      where: { id: mealId },
    });
    
    const deletedSeller = await prisma.user.deleteMany({
      where: { id: sellerId },
    });
    
    const deletedBuyer = await prisma.user.deleteMany({
      where: { id: buyerId },
    });
    
    res.json({
      success: true,
      data: {
        reservationsDeleted: deletedReservation.count,
        mealsDeleted: deletedMeal.count,
        sellersDeleted: deletedSeller.count,
        buyersDeleted: deletedBuyer.count,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

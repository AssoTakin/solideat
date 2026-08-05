import { Router } from 'express';
import prisma from '../config/database';
import bcrypt from 'bcrypt';

const router = Router();

// Reset password for a user (temporary)
router.post('/reset-password/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const newPassword = 'SolideatTest2026!';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
      select: { id: true, email: true },
    });
    
    res.json({ success: true, data: { user, password: newPassword } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

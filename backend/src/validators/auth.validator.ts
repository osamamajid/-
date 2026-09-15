import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'),
    password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 خانات على الأقل'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
    newPassword: z.string().min(6, 'كلمة المرور الجديدة يجب أن تكون 6 أحرف/أرقام على الأقل'),
  }),
});

# DEMO_DEPLOYMENT.md — دليل نشر النسخة التجريبية (عَقيد)

## 1. نظرة عامة على المعمارية (Architecture Overview)

```
┌─────────────────────────────────┐
│     متصفح العميل (Browser)      │
└────────────────┬────────────────┘
                 │ HTTPS
                 ▼
┌─────────────────────────────────┐
│  الواجهة الأمامية (Vercel)       │
│  React 18 + Vite (SPA Rewrite)  │
└────────────────┬────────────────┘
                 │ HTTPS (REST API)
                 ▼
┌─────────────────────────────────┐
│   الخادم الخلفي (Backend API)   │
│  Render / Railway / VPS Docker  │
│  Node.js + Express + TypeScript │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│  قاعدة بيانات تجريبية معزولة    │
│  PostgreSQL (Neon / Supabase)   │
└─────────────────────────────────┘
```

---

## 2. نشر الواجهة الأمامية على Vercel (Frontend Deployment)

### الخطوات:
1. **استيراد المشروع**:
   - توجه إلى لوحة تحكم Vercel واختر `Add New...` > `Project`.
   - اربط مستودع GitHub الخاص بـ `aqeed`.
2. **إعدادات المسار والإطار (Framework Preset)**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
3. **متغيرات البيئة (Environment Variables)**:
   ```env
   VITE_API_URL=https://your-backend-api.onrender.com/api
   ```
   *(استبدل الرابط برابط الخادم الخلفي الفعلي متبوعاً بـ `/api`)*.
4. **التوجيه (SPA Routing)**:
   - تم إنشاء ملف `frontend/vercel.json` تلقائياً لتفادي أخطاء 404 عند تحديث الصفحة أو فتح المسارات مباشرة:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
5. **البناء والنشر**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - اضغط **Deploy**.

---

## 3. نشر الخادم الخلفي (Backend Deployment)

### الخيار الأفضل: Render أو Railway

1. **إنشاء خدمة ويب (Web Service)**:
   - في Render أو Railway، اربط المستودع وحدد المجلد: `backend`.
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/app.js`
2. **متغيرات البيئة الإلزامية (Required Environment Variables)**:
   ```env
   PORT=10000
   NODE_ENV=demo
   DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public
   JWT_SECRET=super_secret_jwt_key_min_32_characters_long_2026
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   ```
3. **تطبيق الترحيل وبذر البيانات**:
   - داخل لوحة Render/Railway Shell:
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```

### خيار VPS باستخدام Docker Compose:
```bash
# 1. نسخ ملف المتغيرات وتعبئته
cp docker-compose.env.example .env
nano .env

# 2. تشغيل الحاويات
docker compose up -d --build

# 3. بذر البيانات الأولية داخل الحاوية
docker compose exec backend npm run db:seed
```

---

## 4. إعداد قاعدة البيانات (Database Configuration)

- **بيئة السحابة (Demo Cloud)**: استخدام قاعدة بيانات PostgreSQL (عبر Neon أو Supabase أو Render PostgreSQL).
- **الترحيل المعتمد**: تشغيل `npx prisma migrate deploy` لتطبيق الهيكل الأولي من مجلد `backend/prisma/migrations/`.
- **البذر الأولي**: تشغيل `npm run db:seed` لتجهيز 6 أنواع عقود، 5 عملاء تجريبيين، 6 عقود، وحساب `demo`.
- **عزل البيانات التجريبية**: قاعدة البيانات التجريبية مستقلة تماماً ولا ترتبط بأي بيانات عملاء حقيقية أو بيانات إنتاج.

---

## 5. ملخص متغيرات البيئة (Environment Variables Summary)

### الخادم الخلفي (Backend)
| المتغير | الوصف | مثال توضيحي |
|---|---|---|
| `PORT` | منفذ تشغيل الخادم | `5000` أو `10000` |
| `NODE_ENV` | بيئة التشغيل (إلزامي للعرض التجريبي) | `demo` |
| `DATABASE_URL` | رابط الاتصال بقاعدة بيانات PostgreSQL | `postgresql://user:pass@host:5432/db?schema=public` |
| `JWT_SECRET` | مفتاح التشفير لجلسات الدخول (32+ حرف) | `aqeed_demo_secure_key_2026_xyz...` |
| `JWT_EXPIRES_IN` | مدة صلاحية الجلسة | `7d` |
| `CORS_ORIGIN` | نطاق الواجهة الأمامية المسموح | `https://aqeed-demo.vercel.app` |
| `ALLOWED_ORIGINS` | قائمة النطاقات المفصولة بفواصل | `https://aqeed-demo.vercel.app` |

### الواجهة الأمامية (Frontend)
| المتغير | الوصف | مثال توضيحي |
|---|---|---|
| `VITE_API_URL` | الرابط العام لـ API الخلفي | `https://aqeed-backend.onrender.com/api` |

---

## 6. أوامر البناء والتشغيل المحلية (Commands Reference)

```bash
# بناء الواجهة الأمامية
cd frontend
npm install
npm run build

# بناء الخادم الخلفي
cd backend
npm install
npm run build

# تشغيل بيئة التطوير
# Frontend:
cd frontend && npm run dev
# Backend:
cd backend && npm run dev
```

---

## 7. بيانات الحساب التجريبي (Demo Credentials)

```yaml
الدخول السريع: زر "دخول النسخة التجريبية مباشرة" بضغطة واحدة من صفحة الدخول
اسم المستخدم اليدوي: demo
كلمة المرور: Demo@12345
الدور: DEMO
```

### صلاحيات الحساب التجريبي المتاحة:
- ✅ استعراض لوحة التحكم والإحصائيات
- ✅ استعراض قائمة العملاء وتفاصيلهم
- ✅ إضافة وتعديل العملاء
- ✅ استعراض قائمة العقود وتفاصيلها الكاملة
- ✅ إنشاء وتعديل العقود بالنماذج والحقول الديناميكية
- ✅ معاينة الوثيقة الرسمية وطباعتها وتصدير PDF
- ✅ استعراض التقارير والرسوم البيانية
- ✅ خوض الجولة التعريفية التفاعلية للنظام (Product Tour)

### العمليات المحمية والمحظورة على الحساب التجريبي:
- ❌ حذف أي عقد أو عميل
- ❌ أرشفة أو استعادة العقود
- ❌ إدارة وحذف المستخدمين
- ❌ تعديل أنواع العقود أو حقول النماذج
- ❌ تعديل إعدادات النظام الحساسة

---

## 8. فحص جاهزية الخادم (Health Check)

```http
GET /api/health
```

الاستجابة المتوقعة:
```json
{
  "success": true,
  "message": "النظام يعمل بشكل ممتاز",
  "data": {
    "status": "UP",
    "system": "نظام عَقيد لإدارة العقود (Aqeed)",
    "timestamp": "2026-09-16T...",
    "environment": "demo"
  }
}
```

---

## 9. فحص حالة الوضع التجريبي (Demo Status)

```http
GET /api/demo/status
```

الاستجابة المتوقعة:
```json
{
  "success": true,
  "message": "حالة الوضع التجريبي",
  "data": {
    "isDemoMode": true,
    "environment": "demo",
    "demoUserExists": true
  }
}
```

---

## 10. كيفية إعادة تعيين البيانات التجريبية (Demo Reset)

### الخيار 1: عبر واجهة البرمجة (API)
يقوم هذا الإجراء بحذف العقود والعملاء المضافين أثناء جلسات العرض التجريبي فقط، مع الإبقاء على العملاء الخمسة الأساسيين وأنواع العقود:
```bash
curl -X POST https://your-backend-api.onrender.com/api/demo/reset \
  -H "Authorization: Bearer <DEMO_USER_TOKEN>"
```

### الخيار 2: عبر إعادة البذر اليدوي (Database Admin)
```bash
cd backend
npm run db:seed
```

---

## 11. مسار تجربة العميل المقترح (Client Walkthrough Flow)

1. **فتح الرابط**: فتح رابط Vercel العام `https://your-demo.vercel.app`.
2. **تسجيل الدخول**: الضغط على **"دخول النسخة التجريبية مباشرة"**.
3. **الجولة التعريفية**: بدء جولة النظام التفاعلية (15 خطوة تشرح لوحة التحكم، العقود، العملاء، النماذج، والتقارير).
4. **لوحة التحكم (Dashboard)**: الاطلاع على مؤشرات الأداء، توزيع العقود، وتنبيهات انتهاء العقود.
5. **العملاء (Customers)**: استعراض سجل العملاء وإضافة عميل جديد.
6. **إنشاء عقد جديد (Create Contract)**:
   - اختيار نوع العقد (مثال: عقد إيجار عقاري أو عقد مروري).
   - اختيار العميل.
   - إدخال التواريخ والمبالغ.
   - تعبئة الحقول الديناميكية المخصصة.
   - حفظ العقد والحصول على رقم تسلسلي آلي.
7. **معاينة وطباعة الوثيقة الرسمية**:
   - فحص معاينة العقد الرسمية بالصيغة القانونية والبنود التلقائية.
   - تجربة زر الطباعة / تصدير PDF.
8. **التقارير (Reports)**: استعراض التحليلات والرسوم البيانية.
9. **تجربة الحماية**: محاولة حذف أي سجل للتأكد من ظهور رسالة الحماية الودية للنسخة التجريبية.
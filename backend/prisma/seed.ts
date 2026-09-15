import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Aqeed Database Seeding...');

  // 1. Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      displayName: 'مسؤول النظام (Administrator)',
      description: 'كامل الصلاحيات لإدارة النظام والمستخدمين والنماذج والتقارير'
    }
  });

  const employeeRole = await prisma.role.upsert({
    where: { name: 'EMPLOYEE' },
    update: {},
    create: {
      name: 'EMPLOYEE',
      displayName: 'موظف عقود (Employee)',
      description: 'إنشاء وتعديل وطباعة العقود وإدارة العملاء'
    }
  });

  const viewerRole = await prisma.role.upsert({
    where: { name: 'VIEWER' },
    update: {},
    create: {
      name: 'VIEWER',
      displayName: 'مشاهد فقط (Viewer)',
      description: 'استعراض العقود والعملاء والطباعة دون إمكانية التعديل أو الحذف'
    }
  });

  // Demo Role - تجربة النظام (Demo/Trial)
  const demoRole = await prisma.role.upsert({
    where: { name: 'DEMO' },
    update: {},
    create: {
      name: 'DEMO',
      displayName: 'مستخدم تجريبي (Demo User)',
      description: 'حساب تجريبي لتجربة النظام مع صلاحيات محدودة وحماية للبيانات'
    }
  });

  console.log('✅ Roles created');

  // 2. Permissions
  const permissionsData = [
    // Users
    { code: 'users:view', name: 'عرض المستخدمين', module: 'users' },
    { code: 'users:create', name: 'إضافة مستخدم', module: 'users' },
    { code: 'users:edit', name: 'تعديل مستخدم', module: 'users' },
    { code: 'users:delete', name: 'حذف مستخدم', module: 'users' },
    // Customers
    { code: 'customers:view', name: 'عرض العملاء', module: 'customers' },
    { code: 'customers:create', name: 'إضافة عميل', module: 'customers' },
    { code: 'customers:edit', name: 'تعديل عميل', module: 'customers' },
    { code: 'customers:delete', name: 'حذف عميل', module: 'customers' },
    // Contracts
    { code: 'contracts:view', name: 'عرض العقود', module: 'contracts' },
    { code: 'contracts:create', name: 'إنشاء عقد', module: 'contracts' },
    { code: 'contracts:edit', name: 'تعديل عقد', module: 'contracts' },
    { code: 'contracts:delete', name: 'حذف عقد', module: 'contracts' },
    { code: 'contracts:archive', name: 'أرشفة واستعادة العقود', module: 'contracts' },
    { code: 'contracts:print', name: 'معاينة وطباعة وتصدير PDF', module: 'contracts' },
    // Templates
    { code: 'templates:manage', name: 'إدارة أنواع وقوالب العقود والحقول', module: 'templates' },
    // Reports
    { code: 'reports:view', name: 'استعراض وتصدير التقارير', module: 'reports' },
    // Audit
    { code: 'audit:view', name: 'استعراض سجل العمليات', module: 'audit' },
    // Settings
    { code: 'settings:view', name: 'عرض إعدادات النظام', module: 'settings' },
    { code: 'settings:edit', name: 'تعديل إعدادات النظام', module: 'settings' },
  ];

  for (const perm of permissionsData) {
    const p = await prisma.permission.upsert({
      where: { code: perm.code },
      update: { name: perm.name, module: perm.module },
      create: perm
    });

    // Link all to ADMIN
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: p.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: p.id }
    });

    // Employee permissions
    if ([
      'customers:view', 'customers:create', 'customers:edit',
      'contracts:view', 'contracts:create', 'contracts:edit', 'contracts:print',
      'reports:view'
    ].includes(perm.code)) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: employeeRole.id, permissionId: p.id } },
        update: {},
        create: { roleId: employeeRole.id, permissionId: p.id }
      });
    }

    // Viewer permissions
    if (['contracts:view', 'contracts:print', 'customers:view', 'reports:view'].includes(perm.code)) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: viewerRole.id, permissionId: p.id } },
        update: {},
        create: { roleId: viewerRole.id, permissionId: p.id }
      });
    }

    // Demo permissions - allow viewing and creating but NOT deleting, archiving, or admin actions
    if ([
      'customers:view', 'customers:create', 'customers:edit',
      'contracts:view', 'contracts:create', 'contracts:edit', 'contracts:print',
      'reports:view'
    ].includes(perm.code)) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: demoRole.id, permissionId: p.id } },
        update: {},
        create: { roleId: demoRole.id, permissionId: p.id }
      });
    }
  }

  console.log('✅ Permissions created and mapped');

  // 3. Users
  const adminPassword = await bcrypt.hash('Admin@123456', 10);
  const employeePassword = await bcrypt.hash('Emp@123456', 10);
  const viewerPassword = await bcrypt.hash('View@123456', 10);

  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@aqeed.local',
      passwordHash: adminPassword,
      fullName: 'مدير النظام التنفيذي',
      phone: '07701234567',
      roleId: adminRole.id,
      isActive: true,
      mustChangePassword: true // إجبار تغيير كلمة المرور عند أول تسجيل دخول كما هو مطلوب
    }
  });

  await prisma.user.upsert({
    where: { username: 'employee' },
    update: {},
    create: {
      username: 'employee',
      email: 'employee@aqeed.local',
      passwordHash: employeePassword,
      fullName: 'أحمد محمود العلي (موظف عقود)',
      phone: '07801234567',
      roleId: employeeRole.id,
      isActive: true,
      mustChangePassword: false
    }
  });

  await prisma.user.upsert({
    where: { username: 'viewer' },
    update: {},
    create: {
      username: 'viewer',
      email: 'viewer@aqeed.local',
      passwordHash: viewerPassword,
      fullName: 'سارة خالد المنصور (مراجع عقود)',
      phone: '07901234567',
      roleId: viewerRole.id,
      isActive: true,
      mustChangePassword: false
    }
  });

  // Demo User - حساب تجريبي
  const demoPassword = await bcrypt.hash('Demo@12345', 10);
  await prisma.user.upsert({
    where: { username: 'demo' },
    update: {},
    create: {
      username: 'demo',
      email: 'demo@aqeed.iq',
      passwordHash: demoPassword,
      fullName: 'مستخدم تجريبي (Demo Account)',
      phone: '07700000000',
      roleId: demoRole.id,
      isActive: true,
      mustChangePassword: false
    }
  });

  console.log('✅ Default users created (Admin with mustChangePassword=true, Demo user added)');

  // 4. Contract Types & Templates & Fields
  const contractTypesData = [
    {
      name: 'عقد مروري (مبايعة / تنازل مركبة)',
      code: 'TRAFFIC',
      description: 'عقود البيع والشراء والتنازل للمركبات والسيارات وإجراءات المرور',
      icon: 'Car',
      terms: '1. يقر الطرف الأول بخلو المركبة من أية حقوق عينية أو حجوزات مرورية أو مطالبات قضائية.\n2. عاين الطرف الثاني المركبة المعاينة التامة النافية للجهالة شرعاً ونظاماً وقبل بشرائها بحالتها الراهنة.\n3. يتحمل الطرف الثاني كافة المخالفات والمسؤوليات القانونية اعتباراً من ساعة وتاريخ توقيع هذا العقد واستلام المركبة.\n4. يتعهد الطرفان بمراجعة الإدارة العامة للمرور لاستكمال نقل الملكية ودفع الرسوم المقررة خلال المدة المحددة.',
      fields: [
        { fieldKey: 'first_party_name', label: 'اسم الطرف الأول (البائع / المتنازل)', fieldType: 'TEXT', isRequired: true, section: 'parties', orderIndex: 1 },
        { fieldKey: 'first_party_id', label: 'رقم هوية الطرف الأول', fieldType: 'TEXT', isRequired: true, section: 'parties', orderIndex: 2 },
        { fieldKey: 'second_party_name', label: 'اسم الطرف الثاني (المشتري / المتنازل له)', fieldType: 'TEXT', isRequired: true, section: 'parties', orderIndex: 3 },
        { fieldKey: 'second_party_id', label: 'رقم هوية الطرف الثاني', fieldType: 'TEXT', isRequired: true, section: 'parties', orderIndex: 4 },
        { fieldKey: 'vehicle_make_model', label: 'نوع المركبة وطرازها', fieldType: 'TEXT', placeholder: 'مثال: تويوتا لاندكروزر GXR', isRequired: true, section: 'details', orderIndex: 5 },
        { fieldKey: 'manufacture_year', label: 'سنة الصنع', fieldType: 'NUMBER', placeholder: '2024', isRequired: true, section: 'details', orderIndex: 6 },
        { fieldKey: 'plate_number', label: 'رقم اللوحة المرورية', fieldType: 'TEXT', placeholder: 'مثال: أ ب ج 1234', isRequired: true, section: 'details', orderIndex: 7 },
        { fieldKey: 'chassis_number', label: 'رقم الهيكل (الشاصي VIN)', fieldType: 'TEXT', isRequired: true, section: 'details', orderIndex: 8 },
        { fieldKey: 'odometer_reading', label: 'قراءة العداد (كم)', fieldType: 'NUMBER', placeholder: 'مثال: 45000', section: 'details', orderIndex: 9 },
        { fieldKey: 'traffic_department', label: 'إدارة المرور المسجل بها', fieldType: 'TEXT', placeholder: 'مرور بغداد', section: 'details', orderIndex: 10 },
        { fieldKey: 'vehicle_condition', label: 'حالة الفحص الفني', fieldType: 'SELECT', options: JSON.stringify(['ساري ومجتاز للفحص الدوري', 'تحت الفحص المشترك', 'بحالة الوكالة']), section: 'details', orderIndex: 11 },
        { fieldKey: 'traffic_notes', label: 'شروط وملاحظات استلام المركبة', fieldType: 'TEXTAREA', section: 'terms', orderIndex: 12 }
      ]
    },
    {
      name: 'عقد إيجار عقاري',
      code: 'RENTAL',
      description: 'عقود إيجار الوحدات السكنية والتجارية والمكاتب والمستودعات',
      icon: 'Home',
      terms: '1. يلتزم المستأجر بسداد القيمة الإيجارية في مواعيد استحقاقها المحددة في هذا العقد دون تأخير.\n2. لا يجوز للمستأجر تأجير العقار من الباطن أو التنازل عن الإيجار للغير دون موافقة خطية صريحة من المؤجر.\n3. يلتزم المستأجر بالمحافظة على العين المؤجرة واستخدامها في الغرض المخصص لها فقط.\n4. يرد مبلغ التأمين للمستأجر عند نهاية العقد وتسليم العين المؤجرة بحالتها الأصلية مع سداد فواتير الخدمات.',
      fields: [
        { fieldKey: 'lessor_name', label: 'اسم المؤجر (الطرف الأول)', fieldType: 'TEXT', isRequired: true, section: 'parties', orderIndex: 1 },
        { fieldKey: 'lessee_name', label: 'اسم المستأجر (الطرف الثاني)', fieldType: 'TEXT', isRequired: true, section: 'parties', orderIndex: 2 },
        { fieldKey: 'property_type', label: 'نوع العقار المؤجر', fieldType: 'SELECT', options: JSON.stringify(['شقة سكنية', 'فيلا مستقلة', 'مكتب تجاري', 'محل / معرض', 'مستودع']), isRequired: true, section: 'details', orderIndex: 3 },
        { fieldKey: 'property_address', label: 'موقع وعنوان العقار بالتفصيل', fieldType: 'TEXT', isRequired: true, section: 'details', orderIndex: 4 },
        { fieldKey: 'electricity_meter', label: 'رقم عداد الكهرباء', fieldType: 'TEXT', section: 'details', orderIndex: 5 },
        { fieldKey: 'rental_duration', label: 'مدة الإيجار الإجمالية', fieldType: 'TEXT', placeholder: 'سنة ميلادية تبدأ من تاريخ البداية', isRequired: true, section: 'details', orderIndex: 6 },
        { fieldKey: 'annual_rent', label: 'مبلغ الإيجار السنوي', fieldType: 'NUMBER', isRequired: true, section: 'financial', orderIndex: 7 },
        { fieldKey: 'security_deposit', label: 'مبلغ التأمين المسترد', fieldType: 'NUMBER', section: 'financial', orderIndex: 8 },
        { fieldKey: 'payment_installments', label: 'جدول الدفعات', fieldType: 'SELECT', options: JSON.stringify(['دفعة واحدة مقدماً', 'دفعتان نصف سنوية', 'أربع دفعات ربع سنوية', 'شهرياً']), isRequired: true, section: 'financial', orderIndex: 9 },
        { fieldKey: 'maintenance_responsibilities', label: 'التزامات الصيانة الخاصة', fieldType: 'TEXTAREA', section: 'terms', orderIndex: 10 }
      ]
    },
    {
      name: 'عقد بيع وتوريد',
      code: 'SALE',
      description: 'عقود بيع البضائع والمعدات والممتلكات المنقولة',
      icon: 'ShoppingBag',
      terms: '1. تم الاتفاق بين الطرفين على بيع وشراء المبيع الموضح بيانه ومواصفاته أعلاه بثمن إجمالي نهائي.\n2. يلتزم البائع بتسليم المبيع للمشتري بالحالة المتفق عليها وخالياً من أي شائبة أو حق للغير.\n3. ينتقل ضمان هلاك المبيع إلى عاتق المشتري بمجرد استلامه الفعلي أو التوقيع على محضر الاستلام.',
      fields: [
        { fieldKey: 'seller_name', label: 'اسم البائع', fieldType: 'TEXT', isRequired: true, section: 'parties', orderIndex: 1 },
        { fieldKey: 'buyer_name', label: 'اسم المشتري', fieldType: 'TEXT', isRequired: true, section: 'parties', orderIndex: 2 },
        { fieldKey: 'item_description', label: 'وصف وتفاصيل المبيع / السلع', fieldType: 'TEXTAREA', isRequired: true, section: 'details', orderIndex: 3 },
        { fieldKey: 'delivery_location', label: 'مكان التسليم المتفق عليه', fieldType: 'TEXT', section: 'details', orderIndex: 4 },
        { fieldKey: 'warranty_period', label: 'مدة الضمان الممنوحة', fieldType: 'TEXT', placeholder: 'مثال: سنة من تاريخ الاستلام', section: 'terms', orderIndex: 5 }
      ]
    },
    {
      name: 'عقد تقديم خدمات واستشارات',
      code: 'SERVICE',
      description: 'عقود تقديم الخدمات الفنية والتقنية والاستشارية والمهنية',
      icon: 'Briefcase',
      terms: '1. يلتزم مقدم الخدمة بإنجاز الأعمال الموكلة إليه وفق أفضل المعايير المهنية المتبعة.\n2. يلتزم العميل بتوفير كافة المتطلبات والمعلومات اللازمة لتمكين مقدم الخدمة من إنجاز العمل.\n3. تخضع حقوق الملكية الفكرية الناتجة عن تقديم الخدمة لما يتفق عليه الطرفان كتابياً.',
      fields: [
        { fieldKey: 'service_provider', label: 'اسم مقدم الخدمة', fieldType: 'TEXT', isRequired: true, section: 'parties', orderIndex: 1 },
        { fieldKey: 'service_recipient', label: 'اسم متلقي الخدمة (العميل)', fieldType: 'TEXT', isRequired: true, section: 'parties', orderIndex: 2 },
        { fieldKey: 'scope_of_work', label: 'نطاق العمل والخدمات المطلوبة', fieldType: 'TEXTAREA', isRequired: true, section: 'details', orderIndex: 3 },
        { fieldKey: 'milestones', label: 'مراحل التسليم والجدول الزمني', fieldType: 'TEXTAREA', section: 'details', orderIndex: 4 },
        { fieldKey: 'confidentiality', label: 'شرط السرية وعدم الإفصاح', fieldType: 'CHECKBOX', section: 'terms', orderIndex: 5 }
      ]
    },
    {
      name: 'عقد عمل وتوظيف',
      code: 'EMPLOYMENT',
      description: 'عقود العمل الفردية وتعيين الكوادر وتحديد المزايا والواجبات',
      icon: 'UserCheck',
      terms: '1. يلتزم الموظف بأداء مهام عمله بأمانة وإخلاص والحفاظ على أسرار العمل وممتلكات المنشأة.\n2. يستحق الموظف إجازة سنوية مدفوعة الأجر وفق نظام العمل واللوائح الداخلية للشركة.\n3. يخضع الموظف لفترة تجربة محددة يحق خلالها لأي من الطرفين إنهاء العقد وفق الأنظمة المرعية.',
      fields: [
        { fieldKey: 'employer_name', label: 'اسم المنشأة / صاحب العمل', fieldType: 'TEXT', isRequired: true, section: 'parties', orderIndex: 1 },
        { fieldKey: 'employee_name', label: 'اسم الموظف الثلاثي', fieldType: 'TEXT', isRequired: true, section: 'parties', orderIndex: 2 },
        { fieldKey: 'job_title', label: 'المسمى الوظيفي', fieldType: 'TEXT', isRequired: true, section: 'details', orderIndex: 3 },
        { fieldKey: 'basic_salary', label: 'الراتب الأساسي الشهري', fieldType: 'NUMBER', isRequired: true, section: 'financial', orderIndex: 4 },
        { fieldKey: 'housing_allowance', label: 'بدل السكن الشهري', fieldType: 'NUMBER', section: 'financial', orderIndex: 5 },
        { fieldKey: 'transport_allowance', label: 'بدل المواصلات الشهري', fieldType: 'NUMBER', section: 'financial', orderIndex: 6 },
        { fieldKey: 'probation_period', label: 'فترة التجربة', fieldType: 'SELECT', options: JSON.stringify(['بدون فترة تجربة', '90 يوماً', '180 يوماً']), section: 'terms', orderIndex: 7 }
      ]
    },
    {
      name: 'عقد اتفاق عام',
      code: 'GENERAL',
      description: 'عقود الشراكة والتفاهم والاتفاقيات العامة المتنوعة',
      icon: 'FileText',
      terms: '1. يعتبر هذا العقد ملزماً ونافذاً في حق طرفيه وخلفائهما النظاميين.\n2. في حال حدوث أي نزاع لا قدر الله حول تفسير أو تطبيق بنود هذا العقد يتم حله ودياً، فإن تعذر يرفع للجهات القضائية المختصة.',
      fields: [
        { fieldKey: 'first_party', label: 'الطرف الأول', fieldType: 'TEXT', isRequired: true, section: 'parties', orderIndex: 1 },
        { fieldKey: 'second_party', label: 'الطرف الثاني', fieldType: 'TEXT', isRequired: true, section: 'parties', orderIndex: 2 },
        { fieldKey: 'agreement_subject', label: 'موضوع الاتفاق والهدف منه', fieldType: 'TEXTAREA', isRequired: true, section: 'details', orderIndex: 3 },
        { fieldKey: 'mutual_obligations', label: 'الالتزامات المتبادلة', fieldType: 'TEXTAREA', isRequired: true, section: 'details', orderIndex: 4 },
        { fieldKey: 'special_clauses', label: 'بنود واستثناءات خاصة', fieldType: 'TEXTAREA', section: 'terms', orderIndex: 5 }
      ]
    }
  ];

  const createdTypes: Record<string, any> = {};

  for (const cType of contractTypesData) {
    const typeRecord = await prisma.contractType.upsert({
      where: { code: cType.code },
      update: { name: cType.name, description: cType.description, icon: cType.icon },
      create: {
        name: cType.name,
        code: cType.code,
        description: cType.description,
        icon: cType.icon,
        isActive: true
      }
    });

    createdTypes[cType.code] = typeRecord;

    // Create or update default template
    const template = await prisma.contractTemplate.upsert({
      where: { id: `template-${cType.code.toLowerCase()}` },
      update: {
        name: `نموذج ${cType.name} القياسي`,
        termsAndConditions: cType.terms
      },
      create: {
        id: `template-${cType.code.toLowerCase()}`,
        contractTypeId: typeRecord.id,
        name: `نموذج ${cType.name} القياسي`,
        termsAndConditions: cType.terms,
        isDefault: true
      }
    });

    // Create Fields
    for (const f of cType.fields) {
      const existingField = await prisma.contractField.findFirst({
        where: { templateId: template.id, fieldKey: f.fieldKey }
      });

      const fieldData = {
        label: f.label,
        fieldType: f.fieldType,
        isRequired: f.isRequired || false,
        options: f.options || null,
        section: f.section || 'details',
        orderIndex: f.orderIndex || 0,
        placeholder: f.placeholder || null
      };

      if (existingField) {
        await prisma.contractField.update({ where: { id: existingField.id }, data: fieldData });
      } else {
        await prisma.contractField.create({
          data: {
            templateId: template.id,
            fieldKey: f.fieldKey,
            ...fieldData
          }
        });
      }
    }
  }

  console.log('✅ 6 Contract Types, Templates and Dynamic Fields created');

  // 5. Customers Seed
  const customersData = [
    {
      customerNumber: 'CUST-0001',
      fullName: 'أحمد علي الكرخي',
      phone: '07711223344',
      nationalId: '1088492019',
      address: 'حي الكرادة - شارع أبو نواس',
      governorate: 'بغداد',
      notes: 'عميل مميز - عقود تأجير وسيارات'
    },
    {
      customerNumber: 'CUST-0002',
      fullName: 'مؤسسة الرافدين للتجارة والمقاولات',
      phone: '07833221100',
      nationalId: '7001928491',
      address: 'حي المنصور - شارع الأميرات',
      governorate: 'بغداد',
      notes: 'حساب تجاري نشط'
    },
    {
      customerNumber: 'CUST-0003',
      fullName: 'حسن عبدالكريم البصري',
      phone: '07777889900',
      nationalId: '1049281726',
      address: 'حي الجزائر - شارع النخيل',
      governorate: 'البصرة',
      notes: 'عقود مركبات وخدمات'
    },
    {
      customerNumber: 'CUST-0004',
      fullName: 'سارة محمود الأربيلية',
      phone: '07534556677',
      nationalId: '1092837465',
      address: 'حي الإسكان - شارع الجامعة',
      governorate: 'أربيل',
      notes: 'عقد إيجار سكني'
    },
    {
      customerNumber: 'CUST-0005',
      fullName: 'شركة التقنية الحديثة للاستشارات',
      phone: '07582233445',
      nationalId: '7009823412',
      address: 'حي 100 متر - مبنى الأعمال',
      governorate: 'أربيل',
      notes: 'عقود خدمات وتطوير'
    }
  ];

  const createdCustomers: any[] = [];
  for (const c of customersData) {
    const cust = await prisma.customer.upsert({
      where: { customerNumber: c.customerNumber },
      update: c,
      create: c
    });
    createdCustomers.push(cust);
  }

  console.log('✅ Sample Customers created');

  // 6. Contracts Seed (With different statuses and upcoming expiry for alerts)
  const now = new Date();
  const in5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 7 days alert
  const in12Days = new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000); // 15 days alert
  const in25Days = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000); // 30 days alert
  const in6Months = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000); // Active long
  const pastExpired = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000); // Expired

  const contractsData = [
    {
      contractNumber: 'CTR-2026-000001',
      contractTypeId: createdTypes['RENTAL'].id,
      customerId: createdCustomers[0].id,
      createdById: adminUser.id,
      issueDate: new Date('2026-01-01'),
      startDate: new Date('2026-01-01'),
      endDate: in5Days, // تنتهي قريباً (أقل من 7 أيام)
      status: 'ACTIVE',
      totalAmount: 60000,
      paymentMethod: 'BANK_TRANSFER',
      notes: 'عقد إيجار مكتب تجاري - ينتهي خلال أيام للتجديد',
      isArchived: false
    },
    {
      contractNumber: 'CTR-2026-000002',
      contractTypeId: createdTypes['TRAFFIC'].id,
      customerId: createdCustomers[2].id,
      createdById: adminUser.id,
      issueDate: new Date('2026-02-15'),
      startDate: new Date('2026-02-15'),
      endDate: in12Days, // تنتهي قريباً (أقل من 15 يوماً)
      status: 'ACTIVE',
      totalAmount: 115000,
      paymentMethod: 'CASH',
      notes: 'مبايعة سيارة لاندكروزر مع التنازل واستكمال النقل',
      isArchived: false
    },
    {
      contractNumber: 'CTR-2026-000003',
      contractTypeId: createdTypes['SERVICE'].id,
      customerId: createdCustomers[1].id,
      createdById: adminUser.id,
      issueDate: new Date('2026-03-01'),
      startDate: new Date('2026-03-01'),
      endDate: in25Days, // تنتهي قريباً (أقل من 30 يوماً)
      status: 'ACTIVE',
      totalAmount: 45000,
      paymentMethod: 'CHEQUE',
      notes: 'عقد استشارات إدارية وفنية',
      isArchived: false
    },
    {
      contractNumber: 'CTR-2026-000004',
      contractTypeId: createdTypes['RENTAL'].id,
      customerId: createdCustomers[3].id,
      createdById: adminUser.id,
      issueDate: new Date('2026-04-01'),
      startDate: new Date('2026-04-01'),
      endDate: in6Months, // فعال لفترة طويلة
      status: 'ACTIVE',
      totalAmount: 75000,
      paymentMethod: 'INSTALLMENT',
      notes: 'عقد إيجار فيلا سكنية بحي الياسمين',
      isArchived: false
    },
    {
      contractNumber: 'CTR-2026-000005',
      contractTypeId: createdTypes['SALE'].id,
      customerId: createdCustomers[4].id,
      createdById: adminUser.id,
      issueDate: new Date('2025-09-01'),
      startDate: new Date('2025-09-01'),
      endDate: pastExpired, // منتهي
      status: 'EXPIRED',
      totalAmount: 92000,
      paymentMethod: 'BANK_TRANSFER',
      notes: 'عقد توريد خوادم ومعدات حاسوبية',
      isArchived: false
    },
    {
      contractNumber: 'CTR-2026-000006',
      contractTypeId: createdTypes['EMPLOYMENT'].id,
      customerId: createdCustomers[0].id,
      createdById: adminUser.id,
      issueDate: new Date(),
      startDate: new Date(),
      endDate: null,
      status: 'DRAFT', // مسودة
      totalAmount: 18000,
      paymentMethod: 'BANK_TRANSFER',
      notes: 'مسودة عقد تعيين مدير مشاريع قيد المراجعة',
      isArchived: false
    }
  ];

  for (const c of contractsData) {
    const createdContract = await prisma.contract.upsert({
      where: { contractNumber: c.contractNumber },
      update: c,
      create: c
    });

    // Populate some dynamic contract values based on type
    const template = await prisma.contractTemplate.findFirst({
      where: { contractTypeId: c.contractTypeId },
      include: { fields: true }
    });

    if (template && template.fields.length > 0) {
      for (const field of template.fields) {
        let sampleVal = '';
        if (field.fieldKey === 'first_party_name' || field.fieldKey === 'lessor_name' || field.fieldKey === 'employer_name' || field.fieldKey === 'service_provider') {
          sampleVal = 'شركة عَقيد للخدمات العامة';
        } else if (field.fieldKey === 'second_party_name' || field.fieldKey === 'lessee_name' || field.fieldKey === 'buyer_name' || field.fieldKey === 'employee_name') {
          sampleVal = createdCustomers[0].fullName;
        } else if (field.fieldKey === 'vehicle_make_model') {
          sampleVal = 'تويوتا لاندكروزر GXR V6';
        } else if (field.fieldKey === 'plate_number') {
          sampleVal = 'أ ب ج 7788';
        } else if (field.fieldKey === 'chassis_number') {
          sampleVal = 'JTMHY05J904128912';
        } else if (field.fieldKey === 'property_address') {
          sampleVal = 'بغداد - حي الكرادة - شارع أبو نواس';
        } else if (field.fieldType === 'NUMBER') {
          sampleVal = String(c.totalAmount || 0);
        } else if (field.fieldType === 'DATE') {
          sampleVal = new Date().toISOString().split('T')[0];
        } else if (field.fieldType === 'SELECT') {
          const options = field.options ? JSON.parse(field.options) : [];
          sampleVal = Array.isArray(options) && options.length > 0 ? options[0] : '';
        } else if (field.fieldType === 'CHECKBOX') {
          sampleVal = 'false';
        } else {
          sampleVal = field.label + ' - قيمة افتراضية معتمدة';
        }

        await prisma.contractValue.upsert({
          where: {
            contractId_fieldId: {
              contractId: createdContract.id,
              fieldId: field.id
            }
          },
          update: { value: sampleVal },
          create: {
            contractId: createdContract.id,
            fieldId: field.id,
            value: sampleVal
          }
        });
      }
    }
  }

  console.log('✅ Contracts with dynamic values seeded');

  // 7. System Settings Seed
  const settingsData = [
    { key: 'company_name', value: 'شركة عَقيد للخدمات العامة وإصدار العقود', group: 'company' },
    { key: 'company_commercial_reg', value: '1010789456', group: 'company' },
    { key: 'company_tax_number', value: '300129384700003', group: 'company' },
    { key: 'company_phone', value: '+964 770 123 4567', group: 'company' },
    { key: 'company_email', value: 'info@aqeed.iq', group: 'company' },
    { key: 'company_address', value: 'العراق - بغداد - شارع الرشيد', group: 'company' },
    { key: 'contract_prefix', value: 'CTR', group: 'general' },
    { key: 'default_currency', value: 'IQD', group: 'general' },
    { key: 'expiry_alert_days', value: '30,15,7', group: 'notifications' },
    { key: 'contract_footer_text', value: 'وثيقة رسمية صادرة عبر منصة عَقيد الإلكترونية - يحق لأطراف العقد التحقق من صحته إلكترونياً', group: 'print' },
  ];

  for (const s of settingsData) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value, group: s.group },
      create: s
    });
  }

  // 8. Audit Log Sample
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'SYSTEM_INITIALIZATION',
      entity: 'System',
      entityId: 'seed',
      details: JSON.stringify({ message: 'تم تثبيت وتهيئة النظام وبذر البيانات الأساسية بنجاح' }),
      ipAddress: '127.0.0.1'
    }
  });

  console.log('✅ System settings and initial audit log seeded successfully!');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

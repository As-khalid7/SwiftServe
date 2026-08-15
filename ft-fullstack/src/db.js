const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const DATA_DIR = path.join(__dirname, "..", "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, "database.sqlite"));
db.pragma("journal_mode = WAL");

// ---------- schema ----------
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    reset_token_hash TEXT,
    reset_token_expires INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS site_content (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    content_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// ---------- default site content (matches the current brand identity) ----------
const DEFAULT_CONTENT = {
  brand: {
    name_ar: "فيوتشر للتقنية",
    name_en: "Future Technology",
    logo_url: ""
  },
  colors: {
    navy: "#0D1B2A",
    panel: "#1F2937",
    teal: "#14B8A6",
    gold: "#D4AF37",
    white: "#FFFFFF"
  },
  hero: {
    title_ar: 'حلول تقنية <span class="accent">للمستقبل</span><br>نبني بنيتكم الرقمية بثقة',
    title_en: 'Tech Solutions <span class="accent">For The Future</span><br>Building your digital foundation with confidence',
    sub_ar: "فيوتشر للتقنية شريككم في الاستشارات والتخطيط التقني، للمنشآت الناشئة و المتوسطة — من تأسيس البنية التحتية إلى تطوير الأنظمة والبرمجيات والأمن السيبراني و الذكاء الاصطناعي.",
    sub_en: "Future Technology is your partner in IT consulting and planning, for startups and mid-sized businesses — from infrastructure setup to systems, software development, cybersecurity, and artificial intelligence.",
    stat1b_ar: "تخطيط", stat1b_en: "Planning",
    stat1s_ar: "قبل التنفيذ", stat1s_en: "Before execution",
    stat2_num: "7",
    stat2s_ar: "مجالات تقنية", stat2s_en: "Tech domains",
    stat3b_ar: "ناشئة", stat3b_en: "Startups",
    stat3s_ar: "إلى متوسطة", stat3s_en: "to SMEs"
  },
  about: {
    title_ar: '<span class="hl-teal">نبتكر</span><span class="dash">.</span> <span class="hl-gold">نطوّر</span><span class="dash">.</span> <span class="hl-teal">نُمكّن</span>',
    title_en: '<span class="hl-teal">Innovate</span><span class="dash">.</span> <span class="hl-gold">Develop</span><span class="dash">.</span> <span class="hl-teal">Empower</span>',
    p1_ar: "نحن فريق تقني متخصص في تقديم حلول متكاملة في البنية التحتية، الشبكات، الأنظمة، الأمن السيبراني، الحلول السحابية، تطوير الأنظمة والحلول الرقمية، الدعم الفني والتحول الرقمي.",
    p1_en: "We are a specialized technical team delivering integrated solutions across infrastructure, networks, systems, cybersecurity, and cloud solutions, along with systems and digital solution development, technical support, and digital transformation.",
    p2_ar: "نعمل على تطوير الأعمال ورفع الكفاءة التقنية من خلال حلول مبتكرة، آمنة وقابلة للتوسع، تواكب احتياجات اليوم وتدعم نمو المستقبل.",
    p2_en: "We help businesses grow and raise their technical efficiency through innovative, secure, and scalable solutions that meet today's needs and support future growth.",
    steps: [
      { label_ar: "01 · نفهم", label_en: "01 · Understand" },
      { label_ar: "02 · نحسب ونخطط", label_en: "02 · Assess & Plan" },
      { label_ar: "03 · نؤسس", label_en: "03 · Build" },
      { label_ar: "04 · نطوّر", label_en: "04 · Develop" },
      { label_ar: "05 · نُسلّم", label_en: "05 · Deliver" }
    ]
  },
  vision: {
    title_ar: "رؤيتنا",
    title_en: "Our Vision",
    text_ar: "نتطلع لنكون الشريك التقني الأول الذي تلجأ إليه المنشآت الناشئة والمتوسطة في المنطقة عند كل قرار تقني، ببناء أساس رقمي متين يواكب نموها من أول يوم ويؤهلها لاستخدام أحدث الحلول التقنية والذكاء الاصطناعي بثقة.",
    text_en: "We aim to be the first technical partner startups and mid-sized businesses in the region turn to for every technology decision — building a solid digital foundation that grows with them from day one and prepares them to confidently adopt the latest technology and AI solutions."
  },
  services: [
    { num: "01", title_ar: "الاستشارات والتخطيط التقني", title_en: "IT Consulting & Planning", desc_ar: "نساعد المنشآت الناشئة على رسم خطة تقنية واضحة من الصفر، تحدد الأولويات والميزانية والأدوات المناسبة قبل التنفيذ.", desc_en: "We help startups draw a clear technical plan from scratch, defining priorities, budget, and the right tools before execution." },
    { num: "02", title_ar: "تأسيس وتطوير البنية التحتية والهاردوير", title_en: "Infrastructure & Hardware Setup", desc_ar: "تصميم وتجهيز البنية التحتية والهاردوير من الأساس، بما يناسب حجم المنشأة ويستوعب نموها لاحقاً.", desc_en: "Designing and setting up infrastructure and hardware from the ground up, sized for your business and ready to scale." },
    { num: "03", title_ar: "البرمجيات والحلول التقنية", title_en: "Software & IT Solutions", desc_ar: "استشارات وتطوير أنظمة وبرمجيات مخصصة تحل مشاكل تشغيلية حقيقية وتُبسّط سير العمل داخل مؤسستكم.", desc_en: "Consulting and development of custom systems and software that solve real operational problems and simplify your workflow." },
    { num: "04", title_ar: "الأمن السيبراني", title_en: "Cybersecurity", desc_ar: "تقييم الثغرات وبناء سياسات حماية للأنظمة والبيانات منذ التأسيس، لا كإضافة لاحقة.", desc_en: "Vulnerability assessment and building protection policies for your systems and data from day one, not as an afterthought." },
    { num: "05", title_ar: "تطوير الويب", title_en: "Web Development", desc_ar: "مواقع وتطبيقات ويب سريعة وآمنة، مبنية بأسس تقنية سليمة تناسب مرحلة نمو منشأتكم.", desc_en: "Fast, secure websites and web apps, built on solid technical foundations that fit your growth stage." },
    { num: "06", title_ar: "الحلول السحابية والأنظمة", title_en: "Cloud Solutions & Systems", desc_ar: "تخطيط وإدارة بنية سحابية وأنظمة مرنة تقلل التكاليف الأولية وتنمو مع أعمالكم بلا إعادة بناء.", desc_en: "Planning and managing a flexible cloud infrastructure that cuts upfront costs and grows with you without rebuilding." },
    { num: "07 · جديد / New", title_ar: "الذكاء الاصطناعي", title_en: "Artificial Intelligence", desc_ar: "دمج حلول الذكاء الاصطناعي في أنظمتكم وعملياتكم — من أتمتة المهام إلى تحليل البيانات واتخاذ قرارات أذكى.", desc_en: "Integrating AI into your systems and operations — from task automation to data analysis and smarter decisions." }
  ],
  contact: {
    title_ar: "جاهزين تبنون أساسكم التقني؟",
    title_en: "Ready to build your technical foundation?",
    desc_ar: "احكولنا عن منشأتكم وطبيعة شغلها، ونطلع لكم بخطوات عملية للتأسيس والتطوير تناسب حجمكم ومرحلتكم. البداية محادثة واحدة على واتساب.",
    desc_en: "Tell us about your business and what it does, and we'll come back with practical steps for setup and development that fit your size and stage. It all starts with one WhatsApp chat.",
    email: "info@futuretech.sa",
    address_ar: "الرياض، المملكة العربية السعودية",
    address_en: "Riyadh, Saudi Arabia",
    whatsapp_number: "966500000000",
    whatsapp_message_ar: "مرحباً Future Technology، أرغب بالاستفسار عن خدماتكم التقنية.",
    whatsapp_message_en: "Hello Future Technology, I'd like to ask about your IT services."
  }
};

function seed() {
  const contentRow = db.prepare("SELECT id FROM site_content WHERE id = 1").get();
  if (!contentRow) {
    db.prepare("INSERT INTO site_content (id, content_json) VALUES (1, ?)").run(
      JSON.stringify(DEFAULT_CONTENT)
    );
    console.log("✔ Default site content created.");
  }

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@futuretech.sa").toLowerCase();
  const existingAdmin = db.prepare("SELECT id FROM users WHERE email = ?").get(adminEmail);
  if (!existingAdmin) {
    const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
    const hash = bcrypt.hashSync(password, 10);
    db.prepare(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')"
    ).run(process.env.ADMIN_NAME || "Admin", adminEmail, hash);
    console.log(`✔ Default admin account created → ${adminEmail} / ${password}`);
    console.log("  ⚠ غيّر كلمة المرور هذي فوراً بعد أول تسجيل دخول.");
  }
}

seed();

module.exports = db;

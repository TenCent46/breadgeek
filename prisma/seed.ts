import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── Enum Mappers ───

const serviceTypeMap: Record<string, "GROUP_LESSON" | "MASTER_COURSE" | "TRIAL_LESSON"> = {
  "group-lesson": "GROUP_LESSON",
  "master-course": "MASTER_COURSE",
  "trial-lesson": "TRIAL_LESSON",
};

const serviceStatusMap: Record<string, "PUBLISHED" | "DRAFT" | "ARCHIVED"> = {
  published: "PUBLISHED",
  draft: "DRAFT",
  archived: "ARCHIVED",
};

const bookingStatusMap: Record<string, "CONFIRMED" | "PENDING" | "CANCELLED" | "COMPLETED"> = {
  confirmed: "CONFIRMED",
  pending: "PENDING",
  cancelled: "CANCELLED",
  completed: "COMPLETED",
};

const customerTierMap: Record<string, "REPEATER" | "REGULAR" | "TRIAL" | "DORMANT"> = {
  repeater: "REPEATER",
  regular: "REGULAR",
  trial: "TRIAL",
  dormant: "DORMANT",
};

const paymentMethodMap: Record<string, "CREDIT_CARD" | "BANK_TRANSFER" | "CONVENIENCE_STORE"> = {
  credit_card: "CREDIT_CARD",
  bank_transfer: "BANK_TRANSFER",
  convenience_store: "CONVENIENCE_STORE",
};

const saleStatusMap: Record<string, "COMPLETED" | "REFUNDED" | "PENDING"> = {
  completed: "COMPLETED",
  refunded: "REFUNDED",
  pending: "PENDING",
};

const messageChannelMap: Record<string, "EMAIL" | "LINE"> = {
  email: "EMAIL",
  line: "LINE",
};

const messageStatusMap: Record<string, "SENT" | "SCHEDULED" | "DRAFT"> = {
  sent: "SENT",
  scheduled: "SCHEDULED",
  draft: "DRAFT",
};

const ingredientCategoryMap: Record<string, "FLOUR" | "DAIRY" | "FAT" | "YEAST" | "SUGAR" | "SUB" | "OTHER"> = {
  "粉類": "FLOUR",
  "乳製品": "DAIRY",
  "油脂": "FAT",
  "酵母": "YEAST",
  "糖類": "SUGAR",
  "副材料": "SUB",
  "その他": "OTHER",
};

const skillLevelMap: Record<string, "BEGINNER" | "INTERMEDIATE" | "ADVANCED"> = {
  beginner: "BEGINNER",
  intermediate: "INTERMEDIATE",
  advanced: "ADVANCED",
};

// ─── Mock Data (inline from src/lib/mock-data.ts) ───

const mockIngredients = [
  {
    oldId: "ing1", name: "強力粉（春よ恋）", currentStockGrams: 8000, unitCostPerKg: 550, supplier: "富澤商店",
    reorderThresholdGrams: 3000, category: "粉類", lastPurchasedAt: "2026-02-20",
    costHistory: [{ date: "2026-01-15", unitCostPerKg: 530 }, { date: "2026-02-20", unitCostPerKg: 550 }],
    createdAt: "2026-01-01", updatedAt: "2026-02-20",
  },
  {
    oldId: "ing2", name: "薄力粉", currentStockGrams: 5000, unitCostPerKg: 380, supplier: "富澤商店",
    reorderThresholdGrams: 2000, category: "粉類", lastPurchasedAt: "2026-02-10",
    costHistory: [{ date: "2026-02-10", unitCostPerKg: 380 }],
    createdAt: "2026-01-01", updatedAt: "2026-02-10",
  },
  {
    oldId: "ing3", name: "無塩バター", currentStockGrams: 1500, unitCostPerKg: 2200, supplier: "よつ葉乳業",
    reorderThresholdGrams: 1000, category: "油脂", lastPurchasedAt: "2026-02-18",
    costHistory: [{ date: "2026-01-10", unitCostPerKg: 2100 }, { date: "2026-02-18", unitCostPerKg: 2200 }],
    createdAt: "2026-01-01", updatedAt: "2026-02-18",
  },
  {
    oldId: "ing4", name: "ドライイースト", currentStockGrams: 400, unitCostPerKg: 3500, supplier: "サフ",
    reorderThresholdGrams: 200, category: "酵母", lastPurchasedAt: "2026-02-05",
    costHistory: [{ date: "2026-02-05", unitCostPerKg: 3500 }],
    createdAt: "2026-01-01", updatedAt: "2026-02-05",
  },
  {
    oldId: "ing5", name: "グラニュー糖", currentStockGrams: 3000, unitCostPerKg: 280, supplier: "スーパー",
    reorderThresholdGrams: 1000, category: "糖類", lastPurchasedAt: "2026-02-15",
    costHistory: [{ date: "2026-02-15", unitCostPerKg: 280 }],
    createdAt: "2026-01-01", updatedAt: "2026-02-15",
  },
  {
    oldId: "ing6", name: "塩", currentStockGrams: 2000, unitCostPerKg: 200, supplier: "スーパー",
    reorderThresholdGrams: 500, category: "副材料", lastPurchasedAt: "2026-01-20",
    costHistory: [{ date: "2026-01-20", unitCostPerKg: 200 }],
    createdAt: "2026-01-01", updatedAt: "2026-01-20",
  },
  {
    oldId: "ing7", name: "牛乳", currentStockGrams: 2000, unitCostPerKg: 220, supplier: "スーパー",
    reorderThresholdGrams: 1000, category: "乳製品", lastPurchasedAt: "2026-02-24",
    costHistory: [{ date: "2026-02-24", unitCostPerKg: 220 }],
    createdAt: "2026-01-01", updatedAt: "2026-02-24",
  },
  {
    oldId: "ing8", name: "卵", currentStockGrams: 600, unitCostPerKg: 450, supplier: "スーパー",
    reorderThresholdGrams: 300, category: "副材料", lastPurchasedAt: "2026-02-24",
    costHistory: [{ date: "2026-02-24", unitCostPerKg: 450 }],
    createdAt: "2026-01-01", updatedAt: "2026-02-24",
  },
];

const mockRecipes = [
  {
    oldId: "rc1", name: "フォカッチャ", description: "オリーブオイルとローズマリーが香るイタリアの定番パン。初心者にも作りやすい。",
    servings: 6,
    ingredients: [
      { ingredientId: "ing1", quantityGrams: 300 },
      { ingredientId: "ing4", quantityGrams: 4 },
      { ingredientId: "ing5", quantityGrams: 10 },
      { ingredientId: "ing6", quantityGrams: 6 },
    ],
    totalCost: 194, costPerServing: 32, notes: "オリーブオイル・ローズマリーは別途用意",
    createdAt: "2026-01-20", updatedAt: "2026-02-15",
  },
  {
    oldId: "rc2", name: "クロワッサン", description: "バターの層が美しいサクサクのクロワッサン。折り込み技術を学ぶ上級レシピ。",
    servings: 4,
    ingredients: [
      { ingredientId: "ing1", quantityGrams: 200 },
      { ingredientId: "ing2", quantityGrams: 50 },
      { ingredientId: "ing3", quantityGrams: 150 },
      { ingredientId: "ing4", quantityGrams: 5 },
      { ingredientId: "ing5", quantityGrams: 30 },
      { ingredientId: "ing6", quantityGrams: 5 },
      { ingredientId: "ing7", quantityGrams: 120 },
    ],
    totalCost: 525, costPerServing: 131, notes: "折り込み用バターは冷蔵庫で十分冷やすこと",
    createdAt: "2026-01-25", updatedAt: "2026-02-18",
  },
  {
    oldId: "rc3", name: "食パン", description: "ふわふわもっちりの山型食パン。毎日食べたくなる定番レシピ。",
    servings: 6,
    ingredients: [
      { ingredientId: "ing1", quantityGrams: 280 },
      { ingredientId: "ing3", quantityGrams: 25 },
      { ingredientId: "ing4", quantityGrams: 4 },
      { ingredientId: "ing5", quantityGrams: 25 },
      { ingredientId: "ing6", quantityGrams: 5 },
      { ingredientId: "ing7", quantityGrams: 190 },
    ],
    totalCost: 261, costPerServing: 44, notes: "1斤型使用",
    createdAt: "2026-02-01", updatedAt: "2026-02-20",
  },
  {
    oldId: "rc4", name: "メロンパン", description: "サクサクのクッキー生地が特徴的な日本の菓子パン。",
    servings: 8,
    ingredients: [
      { ingredientId: "ing1", quantityGrams: 200 },
      { ingredientId: "ing2", quantityGrams: 100 },
      { ingredientId: "ing3", quantityGrams: 80 },
      { ingredientId: "ing4", quantityGrams: 4 },
      { ingredientId: "ing5", quantityGrams: 60 },
      { ingredientId: "ing8", quantityGrams: 50 },
      { ingredientId: "ing7", quantityGrams: 80 },
    ],
    totalCost: 346, costPerServing: 43, notes: "クッキー生地は前日に仕込み可能",
    createdAt: "2026-02-05", updatedAt: "2026-02-22",
  },
  {
    oldId: "rc5", name: "ベーグル", description: "もちもち食感のプレーンベーグル。ケトリングがポイント。",
    servings: 6,
    ingredients: [
      { ingredientId: "ing1", quantityGrams: 300 },
      { ingredientId: "ing4", quantityGrams: 3 },
      { ingredientId: "ing5", quantityGrams: 15 },
      { ingredientId: "ing6", quantityGrams: 5 },
    ],
    totalCost: 181, costPerServing: 30, notes: "ケトリング用のはちみつは別途用意",
    createdAt: "2026-02-10", updatedAt: "2026-02-25",
  },
];

const mockServices = [
  {
    oldId: "s1", type: "group-lesson", title: "初心者パンレッスン〜フォカッチャ〜",
    description: "パン作りが初めての方でも安心。基本の生地作りから焼き上がりまで丁寧に指導します。",
    price: 5500, status: "published", images: [] as string[], capacity: 6, duration: 150, location: "自宅キッチンスタジオ",
    category: "ハード系", linkedRecipeId: "rc1",
    schedules: [
      { oldId: "sc1", date: "2026-03-01", startTime: "10:00", endTime: "12:30", spotsTotal: 6, spotsTaken: 4 },
      { oldId: "sc2", date: "2026-03-08", startTime: "10:00", endTime: "12:30", spotsTotal: 6, spotsTaken: 2 },
    ],
    createdAt: "2026-01-15", updatedAt: "2026-02-20",
  },
  {
    oldId: "s2", type: "master-course", title: "クロワッサンマスターコース（全3回）",
    description: "折り込み技術を基礎から応用まで全3回で習得するコースレッスン。",
    price: 18000, status: "published", images: [] as string[], capacity: 4, duration: 180, location: "自宅キッチンスタジオ",
    category: "菓子パン系", linkedRecipeId: "rc2",
    schedules: [
      { oldId: "sc3", date: "2026-03-05", startTime: "10:00", endTime: "13:00", spotsTotal: 4, spotsTaken: 3 },
      { oldId: "sc4", date: "2026-03-12", startTime: "10:00", endTime: "13:00", spotsTotal: 4, spotsTaken: 3 },
      { oldId: "sc5", date: "2026-03-19", startTime: "10:00", endTime: "13:00", spotsTotal: 4, spotsTaken: 3 },
    ],
    createdAt: "2026-01-20", updatedAt: "2026-02-18",
  },
  {
    oldId: "s3", type: "trial-lesson", title: "はじめてのパン作り体験",
    description: "パン作り未経験の方向けの気軽な体験レッスン。手ごねの楽しさを体感しましょう。",
    price: 3000, status: "published", images: [] as string[], capacity: 8, duration: 120, location: "自宅キッチンスタジオ",
    category: "食パン系", linkedRecipeId: undefined,
    schedules: [
      { oldId: "sc6", date: "2026-03-02", startTime: "14:00", endTime: "16:00", spotsTotal: 8, spotsTaken: 5 },
    ],
    createdAt: "2026-02-01", updatedAt: "2026-02-25",
  },
  {
    oldId: "s4", type: "group-lesson", title: "天然酵母パンレッスン",
    description: "自家製天然酵母を使った本格パン作り。発酵の奥深さを学びます。",
    price: 6500, status: "published", images: [] as string[], capacity: 6, duration: 180, location: "自宅キッチンスタジオ",
    category: "天然酵母", linkedRecipeId: "rc3",
    schedules: [
      { oldId: "sc7", date: "2026-03-10", startTime: "10:00", endTime: "13:00", spotsTotal: 6, spotsTaken: 4 },
    ],
    createdAt: "2026-02-05", updatedAt: "2026-02-22",
  },
  {
    oldId: "s5", type: "group-lesson", title: "親子パン教室〜ベーグル作り〜",
    description: "お子さんと一緒に楽しめるパン教室。ベーグルの成形はお子さんにも大人気！",
    price: 4500, status: "draft", images: [] as string[], capacity: 8, duration: 120, location: "自宅キッチンスタジオ",
    category: "その他", linkedRecipeId: "rc5",
    schedules: [],
    createdAt: "2026-02-10", updatedAt: "2026-02-24",
  },
];

const mockCustomers = [
  {
    oldId: "c1", name: "田中美咲", email: "tanaka@example.com", phone: "090-1234-5678", tier: "repeater",
    totalSpent: 45000, visitCount: 12, lastVisit: "2026-02-25", registeredAt: "2025-06-10",
    tags: ["ハード系好き", "常連"], notes: "毎月参加。フォカッチャが得意。",
    repeatRate: 85, favoriteClassTypes: ["ハード系", "天然酵母"], skillLevel: "intermediate",
  },
  {
    oldId: "c2", name: "佐藤洋平", email: "sato@example.com", phone: "080-2345-6789", tier: "repeater",
    totalSpent: 36000, visitCount: 8, lastVisit: "2026-02-21", registeredAt: "2025-09-15",
    tags: ["コース生"], notes: "クロワッサンコース受講中。パティシエ志望。",
    repeatRate: 72, favoriteClassTypes: ["菓子パン系"], skillLevel: "advanced",
  },
  {
    oldId: "c3", name: "山田花子", email: "yamada@example.com", phone: undefined, tier: "trial",
    totalSpent: 3000, visitCount: 1, lastVisit: "2026-02-18", registeredAt: "2026-02-18",
    tags: ["体験"], notes: "Instagram経由。",
    repeatRate: 0, favoriteClassTypes: [] as string[], skillLevel: "beginner",
  },
  {
    oldId: "c4", name: "鈴木大輝", email: "suzuki@example.com", phone: undefined, tier: "regular",
    totalSpent: 16500, visitCount: 3, lastVisit: "2026-02-20", registeredAt: "2026-01-10",
    tags: ["食パン好き"], notes: "",
    repeatRate: 45, favoriteClassTypes: ["食パン系", "ハード系"], skillLevel: "beginner",
  },
  {
    oldId: "c5", name: "高橋裕子", email: "takahashi@example.com", phone: "070-3456-7890", tier: "repeater",
    totalSpent: 52000, visitCount: 15, lastVisit: "2026-02-23", registeredAt: "2025-04-20",
    tags: ["天然酵母", "アレルギー:卵"], notes: "パン教室のヘビーユーザー。卵アレルギーあり。",
    repeatRate: 92, favoriteClassTypes: ["天然酵母", "ハード系"], skillLevel: "advanced",
  },
  {
    oldId: "c6", name: "伊藤直子", email: "ito@example.com", phone: undefined, tier: "regular",
    totalSpent: 11000, visitCount: 2, lastVisit: "2026-02-24", registeredAt: "2026-01-15",
    tags: ["菓子パン系興味"], notes: "",
    repeatRate: 33, favoriteClassTypes: ["菓子パン系"], skillLevel: "beginner",
  },
  {
    oldId: "c7", name: "渡辺翔太", email: "watanabe@example.com", phone: undefined, tier: "regular",
    totalSpent: 22000, visitCount: 5, lastVisit: "2026-02-25", registeredAt: "2025-08-05",
    tags: ["ハード系好き"], notes: "",
    repeatRate: 55, favoriteClassTypes: ["ハード系"], skillLevel: "intermediate",
  },
  {
    oldId: "c8", name: "中村優子", email: "nakamura@example.com", phone: "090-4567-8901", tier: "dormant",
    totalSpent: 9000, visitCount: 2, lastVisit: "2025-10-10", registeredAt: "2025-07-01",
    tags: [] as string[], notes: "3ヶ月以上来教室なし。",
    repeatRate: 0, favoriteClassTypes: ["食パン系"], skillLevel: "beginner",
  },
  {
    oldId: "c9", name: "小林拓也", email: "kobayashi@example.com", phone: undefined, tier: "regular",
    totalSpent: 16500, visitCount: 3, lastVisit: "2026-02-15", registeredAt: "2025-10-20",
    tags: ["親子教室興味"], notes: "お子さん（7歳）と参加希望。",
    repeatRate: 40, favoriteClassTypes: ["食パン系"], skillLevel: "beginner",
  },
  {
    oldId: "c10", name: "加藤りな", email: "kato@example.com", phone: undefined, tier: "trial",
    totalSpent: 3000, visitCount: 1, lastVisit: "2026-02-22", registeredAt: "2026-02-22",
    tags: ["体験"], notes: "友人の紹介で参加。",
    repeatRate: 0, favoriteClassTypes: [] as string[], skillLevel: "beginner",
  },
];

const mockBookings = [
  { oldId: "b1", serviceId: "s1", customerId: "c1", date: "2026-03-01", startTime: "10:00", endTime: "12:30", status: "confirmed", amount: 5500, notes: "", createdAt: "2026-02-20" },
  { oldId: "b2", serviceId: "s2", customerId: "c2", date: "2026-03-05", startTime: "10:00", endTime: "13:00", status: "confirmed", amount: 18000, notes: "全3回分一括支払い済み", createdAt: "2026-02-21" },
  { oldId: "b3", serviceId: "s3", customerId: "c3", date: "2026-03-02", startTime: "14:00", endTime: "16:00", status: "pending", amount: 3000, notes: "", createdAt: "2026-02-22" },
  { oldId: "b4", serviceId: "s1", customerId: "c4", date: "2026-03-01", startTime: "10:00", endTime: "12:30", status: "confirmed", amount: 5500, notes: "", createdAt: "2026-02-20" },
  { oldId: "b5", serviceId: "s4", customerId: "c5", date: "2026-03-10", startTime: "10:00", endTime: "13:00", status: "confirmed", amount: 6500, notes: "卵アレルギーあり", createdAt: "2026-02-23" },
  { oldId: "b6", serviceId: "s2", customerId: "c6", date: "2026-03-05", startTime: "10:00", endTime: "13:00", status: "pending", amount: 18000, notes: "", createdAt: "2026-02-24" },
  { oldId: "b7", serviceId: "s1", customerId: "c7", date: "2026-03-08", startTime: "10:00", endTime: "12:30", status: "confirmed", amount: 5500, notes: "", createdAt: "2026-02-25" },
  { oldId: "b8", serviceId: "s3", customerId: "c1", date: "2026-03-15", startTime: "14:00", endTime: "16:00", status: "confirmed", amount: 3000, notes: "友人と参加予定", createdAt: "2026-02-25" },
];

const mockReviews = [
  { oldId: "r1", serviceId: "s1", customerId: "c1", rating: 5, comment: "毎月通っています。先生の指導がとても丁寧で、焼き立てのパンの香りに毎回感動します！フォカッチャのコツがやっと掴めました。", reply: "美咲さん、いつもありがとうございます！フォカッチャ上手になりましたね。次はチャバタに挑戦しましょう！", repliedAt: "2026-02-16", createdAt: "2026-02-15" },
  { oldId: "r2", serviceId: "s2", customerId: "c2", rating: 5, comment: "折り込み技術が回を重ねるごとに上達していくのが実感できます。材料も良質で、家で再現できるレシピをもらえるのが嬉しい。", reply: undefined, repliedAt: undefined, createdAt: "2026-02-18" },
  { oldId: "r3", serviceId: "s4", customerId: "c5", rating: 5, comment: "自家製酵母の育て方から教えてもらえて感激。少人数制なので質問もしやすく、パン作りの奥深さを知りました。", reply: "裕子さん、酵母の管理上手になりましたね！次回は全粒粉を使ったレシピにチャレンジしましょう。", repliedAt: "2026-02-24", createdAt: "2026-02-23" },
  { oldId: "r4", serviceId: "s3", customerId: "c3", rating: 4, comment: "初めてのパン作りでしたが、とても楽しかったです！手ごねの感触が気持ちよくて、焼きたてのパンの美味しさに感動しました。", reply: undefined, repliedAt: undefined, createdAt: "2026-02-19" },
  { oldId: "r5", serviceId: "s1", customerId: "c7", rating: 5, comment: "キッチンがとても清潔で、使う材料もこだわりが感じられます。男性一人でも全然気まずくないアットホームな雰囲気が好きです。", reply: undefined, repliedAt: undefined, createdAt: "2026-02-25" },
  { oldId: "r6", serviceId: "s4", customerId: "c4", rating: 4, comment: "天然酵母は初めてでしたが、丁寧に教えてもらえて理解できました。発酵の待ち時間にパンの歴史の話を聞けるのも面白い。", reply: undefined, repliedAt: undefined, createdAt: "2026-02-20" },
  { oldId: "r7", serviceId: "s3", customerId: "c10", rating: 5, comment: "友達に紹介されて参加。想像以上に楽しくて、次は本格的なレッスンに参加したいです！焼き立てパンを持ち帰れるのも最高。", reply: undefined, repliedAt: undefined, createdAt: "2026-02-22" },
  { oldId: "r8", serviceId: "s2", customerId: "c6", rating: 3, comment: "内容は良いのですが、定員が少ないので予約が取りにくいです。もう少し枠を増やしていただけると嬉しいです。", reply: undefined, repliedAt: undefined, createdAt: "2026-02-24" },
];

const mockContacts = [
  { oldId: "ct1", name: "松本真由美", email: "matsumoto@example.com", source: "Instagram", tags: ["パン教室興味"], subscribedAt: "2026-02-10", lastOpened: "2026-02-24" },
  { oldId: "ct2", name: "井上亮", email: "inoue@example.com", source: "ウェブサイト", tags: ["体験希望"], subscribedAt: "2026-02-15", lastOpened: undefined },
  { oldId: "ct3", name: "木村さくら", email: "kimura@example.com", source: "LINE", tags: ["天然酵母興味", "体験希望"], subscribedAt: "2026-01-20", lastOpened: "2026-02-20" },
  { oldId: "ct4", name: "林大介", email: "hayashi@example.com", source: "紹介", tags: ["親子教室興味"], subscribedAt: "2026-02-18", lastOpened: undefined },
  { oldId: "ct5", name: "清水美穂", email: "shimizu@example.com", source: "Instagram", tags: ["パン教室興味", "クロワッサン"], subscribedAt: "2026-01-05", lastOpened: "2026-02-22" },
  { oldId: "ct6", name: "森田健太", email: "morita@example.com", source: "ウェブサイト", tags: ["コース興味"], subscribedAt: "2026-02-20", lastOpened: undefined },
  { oldId: "ct7", name: "藤田あかり", email: "fujita@example.com", source: "LINE", tags: ["体験希望"], subscribedAt: "2026-02-12", lastOpened: "2026-02-25" },
  { oldId: "ct8", name: "岡田翔", email: "okada@example.com", source: "紹介", tags: ["パン教室興味"], subscribedAt: "2026-02-22", lastOpened: undefined },
];

const mockMessages = [
  { oldId: "m1", subject: "3月のレッスンスケジュールのお知らせ", content: "{{name}}さん、こんにちは！3月のレッスンスケジュールが決まりました。", channel: "email", status: "sent", recipientCount: 10, openRate: 72, clickRate: 35, sentAt: "2026-02-20", scheduledAt: undefined, createdAt: "2026-02-19" },
  { oldId: "m2", subject: "クロワッサンコース残席わずか！", content: "大人気のクロワッサンマスターコース、残り1席です。お早めにご予約ください。", channel: "line", status: "sent", recipientCount: 18, openRate: 88, clickRate: 52, sentAt: "2026-02-22", scheduledAt: undefined, createdAt: "2026-02-21" },
  { oldId: "m3", subject: "春の体験レッスンキャンペーン", content: "春の特別キャンペーン。体験レッスンが今だけ2,500円！", channel: "email", status: "scheduled", recipientCount: 28, openRate: undefined, clickRate: undefined, sentAt: undefined, scheduledAt: "2026-03-01", createdAt: "2026-02-25" },
  { oldId: "m4", subject: "本日のレッスンありがとうございました！", content: "{{name}}さん、本日はレッスンにご参加いただきありがとうございました。焼き上がりのお写真、ぜひシェアしてくださいね！", channel: "email", status: "draft", recipientCount: 0, openRate: undefined, clickRate: undefined, sentAt: undefined, scheduledAt: undefined, createdAt: "2026-02-25" },
];

const mockMessageTemplates = [
  { oldId: "mt1", type: "post-lesson-followup", name: "レッスン後フォロー", subject: "本日のレッスンありがとうございました！", content: "{{name}}さん、本日はレッスンにご参加いただきありがとうございました！\n\n今日作ったパンはいかがでしたか？\n焼き上がりのお写真、ぜひシェアしてくださいね。\n\n次回レッスンのご案内はこちら：{{nextLessonLink}}", channel: "email" },
  { oldId: "mt2", type: "next-booking-nudge", name: "次回予約誘導", subject: "次回のレッスン、いかがですか？", content: "{{name}}さん、前回のレッスンから少し時間が経ちましたね。\n\nおすすめのレッスンがございます！\n\nご予約はこちら：{{bookingLink}}", channel: "email" },
  { oldId: "mt3", type: "announcement", name: "お知らせ", subject: "", content: "", channel: "email" },
];

const mockSales = [
  { oldId: "sl1", date: "2026-02-25", serviceName: "初心者パンレッスン〜フォカッチャ〜", customerName: "田中美咲", paymentMethod: "credit_card", amount: 5500, fee: 198, netAmount: 5302, ingredientCost: 194, profit: 5108, profitMargin: 92.9, status: "completed" },
  { oldId: "sl2", date: "2026-02-25", serviceName: "初心者パンレッスン〜フォカッチャ〜", customerName: "渡辺翔太", paymentMethod: "credit_card", amount: 5500, fee: 198, netAmount: 5302, ingredientCost: 194, profit: 5108, profitMargin: 92.9, status: "completed" },
  { oldId: "sl3", date: "2026-02-24", serviceName: "クロワッサンマスターコース（全3回）", customerName: "伊藤直子", paymentMethod: "bank_transfer", amount: 18000, fee: 450, netAmount: 17550, ingredientCost: 525, profit: 17025, profitMargin: 94.6, status: "completed" },
  { oldId: "sl4", date: "2026-02-23", serviceName: "天然酵母パンレッスン", customerName: "高橋裕子", paymentMethod: "credit_card", amount: 6500, fee: 234, netAmount: 6266, ingredientCost: 261, profit: 6005, profitMargin: 92.4, status: "completed" },
  { oldId: "sl5", date: "2026-02-22", serviceName: "はじめてのパン作り体験", customerName: "加藤りな", paymentMethod: "convenience_store", amount: 3000, fee: 300, netAmount: 2700, ingredientCost: 150, profit: 2550, profitMargin: 85.0, status: "completed" },
  { oldId: "sl6", date: "2026-02-21", serviceName: "クロワッサンマスターコース（全3回）", customerName: "佐藤洋平", paymentMethod: "credit_card", amount: 18000, fee: 648, netAmount: 17352, ingredientCost: 525, profit: 16827, profitMargin: 93.5, status: "completed" },
  { oldId: "sl7", date: "2026-02-20", serviceName: "初心者パンレッスン〜フォカッチャ〜", customerName: "鈴木大輝", paymentMethod: "credit_card", amount: 5500, fee: 198, netAmount: 5302, ingredientCost: 194, profit: 5108, profitMargin: 92.9, status: "completed" },
  { oldId: "sl8", date: "2026-02-18", serviceName: "はじめてのパン作り体験", customerName: "山田花子", paymentMethod: "credit_card", amount: 3000, fee: 108, netAmount: 2892, ingredientCost: 150, profit: 2742, profitMargin: 91.4, status: "completed" },
  { oldId: "sl9", date: "2026-02-15", serviceName: "初心者パンレッスン〜フォカッチャ〜", customerName: "高橋裕子", paymentMethod: "credit_card", amount: 5500, fee: 198, netAmount: 5302, ingredientCost: 194, profit: 5108, profitMargin: 92.9, status: "completed" },
  { oldId: "sl10", date: "2026-02-10", serviceName: "天然酵母パンレッスン", customerName: "田中美咲", paymentMethod: "credit_card", amount: 6500, fee: 234, netAmount: 6266, ingredientCost: 261, profit: 6005, profitMargin: 92.4, status: "completed" },
  { oldId: "sl11", date: "2026-02-05", serviceName: "初心者パンレッスン〜フォカッチャ〜", customerName: "小林拓也", paymentMethod: "credit_card", amount: 5500, fee: 198, netAmount: 5302, ingredientCost: 194, profit: 5108, profitMargin: 92.9, status: "completed" },
  { oldId: "sl12", date: "2026-01-25", serviceName: "クロワッサンマスターコース（全3回）", customerName: "佐藤洋平", paymentMethod: "credit_card", amount: 18000, fee: 648, netAmount: 17352, ingredientCost: 525, profit: 16827, profitMargin: 93.5, status: "refunded" },
];

// ─── Seed Function ───

async function main() {
  console.log("Seeding database...");

    // ── 0. Delete all existing data (reverse FK order) ──
    console.log("  Clearing existing data...");
    await prisma.recipeIngredient.deleteMany();
    await prisma.serviceSchedule.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.review.deleteMany();
    await prisma.saleRecord.deleteMany();
    await prisma.distributionMessage.deleteMany();
    await prisma.messageTemplate.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.kitchenSettings.deleteMany();
    await prisma.service.deleteMany();
    await prisma.recipe.deleteMany();
    await prisma.ingredient.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.school.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.user.deleteMany();

    // ── 1. Create Teacher User ──
    console.log("  Creating teacher user...");
    const hashedPassword = await bcrypt.hash("password123", 12);
    const teacher = await prisma.user.create({
      data: {
        email: "tanaka@example.com",
        name: "田中美咲先生",
        passwordHash: hashedPassword,
        role: "TEACHER",
        emailVerified: new Date(),
      },
    });

    // ── 2. Create School ──
    console.log("  Creating school...");
    const school = await prisma.school.create({
      data: {
        slug: "demo-bakery",
        name: "Boulangerie Studio 田中",
        description: "天然酵母と国産小麦にこだわった、少人数制のパン教室",
        location: "東京都世田谷区",
        imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920&q=80&auto=format&fit=crop",
        ownerId: teacher.id,
      },
    });

    // ── 3. Create Ingredients ──
    console.log("  Creating ingredients...");
    const ingredientIdMap = new Map<string, string>();

    for (const ing of mockIngredients) {
      const created = await prisma.ingredient.create({
        data: {
          schoolId: school.id,
          name: ing.name,
          currentStockGrams: ing.currentStockGrams,
          unitCostPerKg: ing.unitCostPerKg,
          supplier: ing.supplier,
          reorderThresholdGrams: ing.reorderThresholdGrams,
          category: ingredientCategoryMap[ing.category],
          lastPurchasedAt: ing.lastPurchasedAt ? new Date(ing.lastPurchasedAt) : null,
          costHistory: ing.costHistory,
          createdAt: new Date(ing.createdAt),
          updatedAt: new Date(ing.updatedAt),
        },
      });
      ingredientIdMap.set(ing.oldId, created.id);
    }

    // ── 4. Create Recipes ──
    console.log("  Creating recipes...");
    const recipeIdMap = new Map<string, string>();

    for (const rec of mockRecipes) {
      const created = await prisma.recipe.create({
        data: {
          schoolId: school.id,
          name: rec.name,
          description: rec.description,
          servings: rec.servings,
          totalCost: rec.totalCost,
          costPerServing: rec.costPerServing,
          notes: rec.notes,
          createdAt: new Date(rec.createdAt),
          updatedAt: new Date(rec.updatedAt),
        },
      });
      recipeIdMap.set(rec.oldId, created.id);

      // Create RecipeIngredient join records
      for (const ri of rec.ingredients) {
        const newIngredientId = ingredientIdMap.get(ri.ingredientId);
        if (!newIngredientId) {
          throw new Error(`Ingredient ${ri.ingredientId} not found in map`);
        }
        await prisma.recipeIngredient.create({
          data: {
            recipeId: created.id,
            ingredientId: newIngredientId,
            quantityGrams: ri.quantityGrams,
          },
        });
      }
    }

    // ── 5. Create Services ──
    console.log("  Creating services...");
    const serviceIdMap = new Map<string, string>();

    for (const svc of mockServices) {
      const linkedRecipeId = svc.linkedRecipeId ? recipeIdMap.get(svc.linkedRecipeId) : null;

      const created = await prisma.service.create({
        data: {
          schoolId: school.id,
          type: serviceTypeMap[svc.type],
          title: svc.title,
          description: svc.description,
          price: svc.price,
          status: serviceStatusMap[svc.status],
          images: svc.images,
          capacity: svc.capacity,
          duration: svc.duration,
          location: svc.location,
          category: svc.category,
          linkedRecipeId: linkedRecipeId ?? null,
          createdAt: new Date(svc.createdAt),
          updatedAt: new Date(svc.updatedAt),
        },
      });
      serviceIdMap.set(svc.oldId, created.id);

      // Create ServiceSchedule records
      for (const sch of svc.schedules) {
        await prisma.serviceSchedule.create({
          data: {
            serviceId: created.id,
            date: new Date(sch.date),
            startTime: sch.startTime,
            endTime: sch.endTime,
            spotsTotal: sch.spotsTotal,
            spotsTaken: sch.spotsTaken,
          },
        });
      }
    }

    // ── 6. Create Customers ──
    console.log("  Creating customers...");
    const customerIdMap = new Map<string, string>();

    for (const cust of mockCustomers) {
      const created = await prisma.customer.create({
        data: {
          schoolId: school.id,
          name: cust.name,
          email: cust.email,
          phone: cust.phone ?? null,
          tier: customerTierMap[cust.tier],
          totalSpent: cust.totalSpent,
          visitCount: cust.visitCount,
          lastVisit: cust.lastVisit ? new Date(cust.lastVisit) : null,
          registeredAt: new Date(cust.registeredAt),
          tags: cust.tags,
          notes: cust.notes,
          repeatRate: cust.repeatRate,
          favoriteClassTypes: cust.favoriteClassTypes,
          skillLevel: skillLevelMap[cust.skillLevel],
        },
      });
      customerIdMap.set(cust.oldId, created.id);
    }

    // ── 7. Create Bookings ──
    console.log("  Creating bookings...");
    for (const bk of mockBookings) {
      const newServiceId = serviceIdMap.get(bk.serviceId);
      const newCustomerId = customerIdMap.get(bk.customerId);
      if (!newServiceId || !newCustomerId) {
        throw new Error(`Missing FK mapping for booking ${bk.oldId}: service=${bk.serviceId}, customer=${bk.customerId}`);
      }
      await prisma.booking.create({
        data: {
          serviceId: newServiceId,
          customerId: newCustomerId,
          date: new Date(bk.date),
          startTime: bk.startTime,
          endTime: bk.endTime,
          status: bookingStatusMap[bk.status],
          amount: bk.amount,
          notes: bk.notes,
          createdAt: new Date(bk.createdAt),
        },
      });
    }

    // ── 8. Create Reviews ──
    console.log("  Creating reviews...");
    for (const rev of mockReviews) {
      const newServiceId = serviceIdMap.get(rev.serviceId);
      const newCustomerId = customerIdMap.get(rev.customerId);
      if (!newServiceId || !newCustomerId) {
        throw new Error(`Missing FK mapping for review ${rev.oldId}: service=${rev.serviceId}, customer=${rev.customerId}`);
      }
      await prisma.review.create({
        data: {
          serviceId: newServiceId,
          customerId: newCustomerId,
          rating: rev.rating,
          comment: rev.comment,
          reply: rev.reply ?? null,
          repliedAt: rev.repliedAt ? new Date(rev.repliedAt) : null,
          createdAt: new Date(rev.createdAt),
        },
      });
    }

    // ── 9. Create Contacts ──
    console.log("  Creating contacts...");
    for (const ct of mockContacts) {
      await prisma.contact.create({
        data: {
          schoolId: school.id,
          name: ct.name,
          email: ct.email,
          source: ct.source,
          tags: ct.tags,
          subscribedAt: new Date(ct.subscribedAt),
          lastOpened: ct.lastOpened ? new Date(ct.lastOpened) : null,
        },
      });
    }

    // ── 10. Create Messages ──
    console.log("  Creating messages...");
    for (const msg of mockMessages) {
      await prisma.distributionMessage.create({
        data: {
          schoolId: school.id,
          subject: msg.subject,
          content: msg.content,
          channel: messageChannelMap[msg.channel],
          status: messageStatusMap[msg.status],
          recipientCount: msg.recipientCount,
          openRate: msg.openRate ?? null,
          clickRate: msg.clickRate ?? null,
          sentAt: msg.sentAt ? new Date(msg.sentAt) : null,
          scheduledAt: msg.scheduledAt ? new Date(msg.scheduledAt) : null,
          createdAt: new Date(msg.createdAt),
        },
      });
    }

    // ── 11. Create Message Templates ──
    console.log("  Creating message templates...");
    for (const tmpl of mockMessageTemplates) {
      await prisma.messageTemplate.create({
        data: {
          schoolId: school.id,
          type: tmpl.type,
          name: tmpl.name,
          subject: tmpl.subject,
          content: tmpl.content,
          channel: messageChannelMap[tmpl.channel],
        },
      });
    }

    // ── 12. Create Sale Records ──
    console.log("  Creating sale records...");

    // Build a lookup from serviceName to new serviceId for linking sales
    const serviceNameToIdMap = new Map<string, string>();
    for (const svc of mockServices) {
      const newId = serviceIdMap.get(svc.oldId);
      if (newId) {
        serviceNameToIdMap.set(svc.title, newId);
      }
    }

    for (const sale of mockSales) {
      await prisma.saleRecord.create({
        data: {
          schoolId: school.id,
          serviceId: serviceNameToIdMap.get(sale.serviceName) ?? null,
          date: new Date(sale.date),
          serviceName: sale.serviceName,
          customerName: sale.customerName,
          paymentMethod: paymentMethodMap[sale.paymentMethod],
          amount: sale.amount,
          fee: sale.fee,
          netAmount: sale.netAmount,
          ingredientCost: sale.ingredientCost,
          profit: sale.profit,
          profitMargin: sale.profitMargin,
          status: saleStatusMap[sale.status],
        },
      });
    }

    // ── 13. Create Kitchen Settings ──
    console.log("  Creating kitchen settings...");
    await prisma.kitchenSettings.create({
      data: {
        schoolId: school.id,
        maxCapacity: 8,
        defaultLessonDuration: 150,
        ingredientReorderLeadDays: 3,
        defaultOverheadPerLesson: 2500,
        platformFeePercent: 3.6,
      },
    });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import type {
  Service, Booking, Customer, Contact, Review,
  DistributionMessage, SaleRecord, MonthlySales, MonthlyProfit,
  Ingredient, Recipe, MessageTemplate, KitchenSettings,
} from "./types";

// ─── Ingredients ───
export const mockIngredients: Ingredient[] = [
  {
    id: "ing1", name: "強力粉（春よ恋）", currentStockGrams: 8000, unitCostPerKg: 550, supplier: "富澤商店",
    reorderThresholdGrams: 3000, category: "粉類", lastPurchasedAt: "2026-02-20",
    costHistory: [{ date: "2026-01-15", unitCostPerKg: 530 }, { date: "2026-02-20", unitCostPerKg: 550 }],
    createdAt: "2026-01-01", updatedAt: "2026-02-20",
  },
  {
    id: "ing2", name: "薄力粉", currentStockGrams: 5000, unitCostPerKg: 380, supplier: "富澤商店",
    reorderThresholdGrams: 2000, category: "粉類", lastPurchasedAt: "2026-02-10",
    costHistory: [{ date: "2026-02-10", unitCostPerKg: 380 }],
    createdAt: "2026-01-01", updatedAt: "2026-02-10",
  },
  {
    id: "ing3", name: "無塩バター", currentStockGrams: 1500, unitCostPerKg: 2200, supplier: "よつ葉乳業",
    reorderThresholdGrams: 1000, category: "油脂", lastPurchasedAt: "2026-02-18",
    costHistory: [{ date: "2026-01-10", unitCostPerKg: 2100 }, { date: "2026-02-18", unitCostPerKg: 2200 }],
    createdAt: "2026-01-01", updatedAt: "2026-02-18",
  },
  {
    id: "ing4", name: "ドライイースト", currentStockGrams: 400, unitCostPerKg: 3500, supplier: "サフ",
    reorderThresholdGrams: 200, category: "酵母", lastPurchasedAt: "2026-02-05",
    costHistory: [{ date: "2026-02-05", unitCostPerKg: 3500 }],
    createdAt: "2026-01-01", updatedAt: "2026-02-05",
  },
  {
    id: "ing5", name: "グラニュー糖", currentStockGrams: 3000, unitCostPerKg: 280, supplier: "スーパー",
    reorderThresholdGrams: 1000, category: "糖類", lastPurchasedAt: "2026-02-15",
    costHistory: [{ date: "2026-02-15", unitCostPerKg: 280 }],
    createdAt: "2026-01-01", updatedAt: "2026-02-15",
  },
  {
    id: "ing6", name: "塩", currentStockGrams: 2000, unitCostPerKg: 200, supplier: "スーパー",
    reorderThresholdGrams: 500, category: "副材料", lastPurchasedAt: "2026-01-20",
    costHistory: [{ date: "2026-01-20", unitCostPerKg: 200 }],
    createdAt: "2026-01-01", updatedAt: "2026-01-20",
  },
  {
    id: "ing7", name: "牛乳", currentStockGrams: 2000, unitCostPerKg: 220, supplier: "スーパー",
    reorderThresholdGrams: 1000, category: "乳製品", lastPurchasedAt: "2026-02-24",
    costHistory: [{ date: "2026-02-24", unitCostPerKg: 220 }],
    createdAt: "2026-01-01", updatedAt: "2026-02-24",
  },
  {
    id: "ing8", name: "卵", currentStockGrams: 600, unitCostPerKg: 450, supplier: "スーパー",
    reorderThresholdGrams: 300, category: "副材料", lastPurchasedAt: "2026-02-24",
    costHistory: [{ date: "2026-02-24", unitCostPerKg: 450 }],
    createdAt: "2026-01-01", updatedAt: "2026-02-24",
  },
];

// ─── Recipes ───
export const mockRecipes: Recipe[] = [
  {
    id: "rc1", name: "フォカッチャ", description: "オリーブオイルとローズマリーが香るイタリアの定番パン。初心者にも作りやすい。",
    servings: 6,
    ingredients: [
      { ingredientId: "ing1", ingredientName: "強力粉（春よ恋）", quantityGrams: 300 },
      { ingredientId: "ing4", ingredientName: "ドライイースト", quantityGrams: 4 },
      { ingredientId: "ing5", ingredientName: "グラニュー糖", quantityGrams: 10 },
      { ingredientId: "ing6", ingredientName: "塩", quantityGrams: 6 },
    ],
    totalCost: 194, costPerServing: 32, linkedServiceId: "s1", notes: "オリーブオイル・ローズマリーは別途用意",
    createdAt: "2026-01-20", updatedAt: "2026-02-15",
  },
  {
    id: "rc2", name: "クロワッサン", description: "バターの層が美しいサクサクのクロワッサン。折り込み技術を学ぶ上級レシピ。",
    servings: 4,
    ingredients: [
      { ingredientId: "ing1", ingredientName: "強力粉（春よ恋）", quantityGrams: 200 },
      { ingredientId: "ing2", ingredientName: "薄力粉", quantityGrams: 50 },
      { ingredientId: "ing3", ingredientName: "無塩バター", quantityGrams: 150 },
      { ingredientId: "ing4", ingredientName: "ドライイースト", quantityGrams: 5 },
      { ingredientId: "ing5", ingredientName: "グラニュー糖", quantityGrams: 30 },
      { ingredientId: "ing6", ingredientName: "塩", quantityGrams: 5 },
      { ingredientId: "ing7", ingredientName: "牛乳", quantityGrams: 120 },
    ],
    totalCost: 525, costPerServing: 131, linkedServiceId: "s2", notes: "折り込み用バターは冷蔵庫で十分冷やすこと",
    createdAt: "2026-01-25", updatedAt: "2026-02-18",
  },
  {
    id: "rc3", name: "食パン", description: "ふわふわもっちりの山型食パン。毎日食べたくなる定番レシピ。",
    servings: 6,
    ingredients: [
      { ingredientId: "ing1", ingredientName: "強力粉（春よ恋）", quantityGrams: 280 },
      { ingredientId: "ing3", ingredientName: "無塩バター", quantityGrams: 25 },
      { ingredientId: "ing4", ingredientName: "ドライイースト", quantityGrams: 4 },
      { ingredientId: "ing5", ingredientName: "グラニュー糖", quantityGrams: 25 },
      { ingredientId: "ing6", ingredientName: "塩", quantityGrams: 5 },
      { ingredientId: "ing7", ingredientName: "牛乳", quantityGrams: 190 },
    ],
    totalCost: 261, costPerServing: 44, linkedServiceId: "s4", notes: "1斤型使用",
    createdAt: "2026-02-01", updatedAt: "2026-02-20",
  },
  {
    id: "rc4", name: "メロンパン", description: "サクサクのクッキー生地が特徴的な日本の菓子パン。",
    servings: 8,
    ingredients: [
      { ingredientId: "ing1", ingredientName: "強力粉（春よ恋）", quantityGrams: 200 },
      { ingredientId: "ing2", ingredientName: "薄力粉", quantityGrams: 100 },
      { ingredientId: "ing3", ingredientName: "無塩バター", quantityGrams: 80 },
      { ingredientId: "ing4", ingredientName: "ドライイースト", quantityGrams: 4 },
      { ingredientId: "ing5", ingredientName: "グラニュー糖", quantityGrams: 60 },
      { ingredientId: "ing8", ingredientName: "卵", quantityGrams: 50 },
      { ingredientId: "ing7", ingredientName: "牛乳", quantityGrams: 80 },
    ],
    totalCost: 346, costPerServing: 43, notes: "クッキー生地は前日に仕込み可能",
    createdAt: "2026-02-05", updatedAt: "2026-02-22",
  },
  {
    id: "rc5", name: "ベーグル", description: "もちもち食感のプレーンベーグル。ケトリングがポイント。",
    servings: 6,
    ingredients: [
      { ingredientId: "ing1", ingredientName: "強力粉（春よ恋）", quantityGrams: 300 },
      { ingredientId: "ing4", ingredientName: "ドライイースト", quantityGrams: 3 },
      { ingredientId: "ing5", ingredientName: "グラニュー糖", quantityGrams: 15 },
      { ingredientId: "ing6", ingredientName: "塩", quantityGrams: 5 },
    ],
    totalCost: 181, costPerServing: 30, linkedServiceId: "s5", notes: "ケトリング用のはちみつは別途用意",
    createdAt: "2026-02-10", updatedAt: "2026-02-25",
  },
];

// ─── Services ───
export const mockServices: Service[] = [
  {
    id: "s1", type: "group-lesson", title: "初心者パンレッスン〜フォカッチャ〜",
    description: "パン作りが初めての方でも安心。基本の生地作りから焼き上がりまで丁寧に指導します。",
    price: 5500, status: "published", images: [], capacity: 6, duration: 150, location: "自宅キッチンスタジオ",
    category: "ハード系", linkedRecipeId: "rc1",
    schedules: [
      { id: "sc1", date: "2026-03-01", startTime: "10:00", endTime: "12:30", spotsTotal: 6, spotsTaken: 4 },
      { id: "sc2", date: "2026-03-08", startTime: "10:00", endTime: "12:30", spotsTotal: 6, spotsTaken: 2 },
    ],
    createdAt: "2026-01-15", updatedAt: "2026-02-20",
  },
  {
    id: "s2", type: "master-course", title: "クロワッサンマスターコース（全3回）",
    description: "折り込み技術を基礎から応用まで全3回で習得するコースレッスン。",
    price: 18000, status: "published", images: [], capacity: 4, duration: 180, location: "自宅キッチンスタジオ",
    category: "菓子パン系", linkedRecipeId: "rc2",
    schedules: [
      { id: "sc3", date: "2026-03-05", startTime: "10:00", endTime: "13:00", spotsTotal: 4, spotsTaken: 3 },
      { id: "sc4", date: "2026-03-12", startTime: "10:00", endTime: "13:00", spotsTotal: 4, spotsTaken: 3 },
      { id: "sc5", date: "2026-03-19", startTime: "10:00", endTime: "13:00", spotsTotal: 4, spotsTaken: 3 },
    ],
    createdAt: "2026-01-20", updatedAt: "2026-02-18",
  },
  {
    id: "s3", type: "trial-lesson", title: "はじめてのパン作り体験",
    description: "パン作り未経験の方向けの気軽な体験レッスン。手ごねの楽しさを体感しましょう。",
    price: 3000, status: "published", images: [], capacity: 8, duration: 120, location: "自宅キッチンスタジオ",
    category: "食パン系",
    schedules: [
      { id: "sc6", date: "2026-03-02", startTime: "14:00", endTime: "16:00", spotsTotal: 8, spotsTaken: 5 },
    ],
    createdAt: "2026-02-01", updatedAt: "2026-02-25",
  },
  {
    id: "s4", type: "group-lesson", title: "天然酵母パンレッスン",
    description: "自家製天然酵母を使った本格パン作り。発酵の奥深さを学びます。",
    price: 6500, status: "published", images: [], capacity: 6, duration: 180, location: "自宅キッチンスタジオ",
    category: "天然酵母", linkedRecipeId: "rc3",
    schedules: [
      { id: "sc7", date: "2026-03-10", startTime: "10:00", endTime: "13:00", spotsTotal: 6, spotsTaken: 4 },
    ],
    createdAt: "2026-02-05", updatedAt: "2026-02-22",
  },
  {
    id: "s5", type: "group-lesson", title: "親子パン教室〜ベーグル作り〜",
    description: "お子さんと一緒に楽しめるパン教室。ベーグルの成形はお子さんにも大人気！",
    price: 4500, status: "draft", images: [], capacity: 8, duration: 120, location: "自宅キッチンスタジオ",
    category: "その他", linkedRecipeId: "rc5",
    schedules: [],
    createdAt: "2026-02-10", updatedAt: "2026-02-24",
  },
];

// ─── Bookings ───
export const mockBookings: Booking[] = [
  { id: "b1", serviceId: "s1", serviceName: "初心者パンレッスン〜フォカッチャ〜", serviceType: "group-lesson", customerId: "c1", customerName: "田中美咲", customerEmail: "tanaka@example.com", date: "2026-03-01", startTime: "10:00", endTime: "12:30", status: "confirmed", amount: 5500, paymentType: "on_site", participants: 1, notes: "", createdAt: "2026-02-20" },
  { id: "b2", serviceId: "s2", serviceName: "クロワッサンマスターコース（全3回）", serviceType: "master-course", customerId: "c2", customerName: "佐藤洋平", customerEmail: "sato@example.com", date: "2026-03-05", startTime: "10:00", endTime: "13:00", status: "confirmed", amount: 18000, paymentType: "on_site", participants: 1, notes: "全3回分一括支払い済み", createdAt: "2026-02-21" },
  { id: "b3", serviceId: "s3", serviceName: "はじめてのパン作り体験", serviceType: "trial-lesson", customerId: "c3", customerName: "山田花子", customerEmail: "yamada@example.com", date: "2026-03-02", startTime: "14:00", endTime: "16:00", status: "pending", amount: 3000, paymentType: "on_site", participants: 1, notes: "", createdAt: "2026-02-22" },
  { id: "b4", serviceId: "s1", serviceName: "初心者パンレッスン〜フォカッチャ〜", serviceType: "group-lesson", customerId: "c4", customerName: "鈴木大輝", customerEmail: "suzuki@example.com", date: "2026-03-01", startTime: "10:00", endTime: "12:30", status: "confirmed", amount: 5500, paymentType: "on_site", participants: 1, notes: "", createdAt: "2026-02-20" },
  { id: "b5", serviceId: "s4", serviceName: "天然酵母パンレッスン", serviceType: "group-lesson", customerId: "c5", customerName: "高橋裕子", customerEmail: "takahashi@example.com", date: "2026-03-10", startTime: "10:00", endTime: "13:00", status: "confirmed", amount: 6500, paymentType: "on_site", participants: 1, notes: "卵アレルギーあり", createdAt: "2026-02-23" },
  { id: "b6", serviceId: "s2", serviceName: "クロワッサンマスターコース（全3回）", serviceType: "master-course", customerId: "c6", customerName: "伊藤直子", customerEmail: "ito@example.com", date: "2026-03-05", startTime: "10:00", endTime: "13:00", status: "pending", amount: 18000, paymentType: "on_site", participants: 1, notes: "", createdAt: "2026-02-24" },
  { id: "b7", serviceId: "s1", serviceName: "初心者パンレッスン〜フォカッチャ〜", serviceType: "group-lesson", customerId: "c7", customerName: "渡辺翔太", customerEmail: "watanabe@example.com", date: "2026-03-08", startTime: "10:00", endTime: "12:30", status: "confirmed", amount: 5500, paymentType: "on_site", participants: 1, notes: "", createdAt: "2026-02-25" },
  { id: "b8", serviceId: "s3", serviceName: "はじめてのパン作り体験", serviceType: "trial-lesson", customerId: "c1", customerName: "田中美咲", customerEmail: "tanaka@example.com", date: "2026-03-15", startTime: "14:00", endTime: "16:00", status: "confirmed", amount: 3000, paymentType: "on_site", participants: 2, notes: "友人と参加予定", createdAt: "2026-02-25" },
];

// ─── Customers ───
export const mockCustomers: Customer[] = [
  { id: "c1", name: "田中美咲", email: "tanaka@example.com", phone: "090-1234-5678", tier: "repeater", totalSpent: 45000, visitCount: 12, lastVisit: "2026-02-25", registeredAt: "2025-06-10", tags: ["ハード系好き", "常連"], notes: "毎月参加。フォカッチャが得意。", purchases: [
    { id: "p1", serviceName: "初心者パンレッスン〜フォカッチャ〜", amount: 5500, date: "2026-02-25", status: "completed" },
    { id: "p2", serviceName: "天然酵母パンレッスン", amount: 6500, date: "2026-02-10", status: "completed" },
  ], repeatRate: 85, favoriteClassTypes: ["ハード系", "天然酵母"], skillLevel: "intermediate" },
  { id: "c2", name: "佐藤洋平", email: "sato@example.com", phone: "080-2345-6789", tier: "repeater", totalSpent: 36000, visitCount: 8, lastVisit: "2026-02-21", registeredAt: "2025-09-15", tags: ["コース生"], notes: "クロワッサンコース受講中。パティシエ志望。", purchases: [
    { id: "p3", serviceName: "クロワッサンマスターコース（全3回）", amount: 18000, date: "2026-02-21", status: "completed" },
  ], repeatRate: 72, favoriteClassTypes: ["菓子パン系"], skillLevel: "advanced" },
  { id: "c3", name: "山田花子", email: "yamada@example.com", tier: "trial", totalSpent: 3000, visitCount: 1, lastVisit: "2026-02-18", registeredAt: "2026-02-18", tags: ["体験"], notes: "Instagram経由。", purchases: [
    { id: "p4", serviceName: "はじめてのパン作り体験", amount: 3000, date: "2026-02-18", status: "completed" },
  ], repeatRate: 0, favoriteClassTypes: [], skillLevel: "beginner" },
  { id: "c4", name: "鈴木大輝", email: "suzuki@example.com", tier: "regular", totalSpent: 16500, visitCount: 3, lastVisit: "2026-02-20", registeredAt: "2026-01-10", tags: ["食パン好き"], notes: "", purchases: [
    { id: "p5", serviceName: "初心者パンレッスン〜フォカッチャ〜", amount: 5500, date: "2026-02-20", status: "completed" },
  ], repeatRate: 45, favoriteClassTypes: ["食パン系", "ハード系"], skillLevel: "beginner" },
  { id: "c5", name: "高橋裕子", email: "takahashi@example.com", phone: "070-3456-7890", tier: "repeater", totalSpent: 52000, visitCount: 15, lastVisit: "2026-02-23", registeredAt: "2025-04-20", tags: ["天然酵母", "アレルギー:卵"], notes: "パン教室のヘビーユーザー。卵アレルギーあり。", purchases: [
    { id: "p6", serviceName: "天然酵母パンレッスン", amount: 6500, date: "2026-02-23", status: "completed" },
    { id: "p7", serviceName: "初心者パンレッスン〜フォカッチャ〜", amount: 5500, date: "2026-02-15", status: "completed" },
  ], repeatRate: 92, favoriteClassTypes: ["天然酵母", "ハード系"], skillLevel: "advanced" },
  { id: "c6", name: "伊藤直子", email: "ito@example.com", tier: "regular", totalSpent: 11000, visitCount: 2, lastVisit: "2026-02-24", registeredAt: "2026-01-15", tags: ["菓子パン系興味"], notes: "", purchases: [
    { id: "p8", serviceName: "初心者パンレッスン〜フォカッチャ〜", amount: 5500, date: "2026-01-20", status: "completed" },
  ], repeatRate: 33, favoriteClassTypes: ["菓子パン系"], skillLevel: "beginner" },
  { id: "c7", name: "渡辺翔太", email: "watanabe@example.com", tier: "regular", totalSpent: 22000, visitCount: 5, lastVisit: "2026-02-25", registeredAt: "2025-08-05", tags: ["ハード系好き"], notes: "", purchases: [
    { id: "p9", serviceName: "初心者パンレッスン〜フォカッチャ〜", amount: 5500, date: "2026-02-25", status: "completed" },
  ], repeatRate: 55, favoriteClassTypes: ["ハード系"], skillLevel: "intermediate" },
  { id: "c8", name: "中村優子", email: "nakamura@example.com", phone: "090-4567-8901", tier: "dormant", totalSpent: 9000, visitCount: 2, lastVisit: "2025-10-10", registeredAt: "2025-07-01", tags: [], notes: "3ヶ月以上来教室なし。", purchases: [], repeatRate: 0, favoriteClassTypes: ["食パン系"], skillLevel: "beginner" },
  { id: "c9", name: "小林拓也", email: "kobayashi@example.com", tier: "regular", totalSpent: 16500, visitCount: 3, lastVisit: "2026-02-15", registeredAt: "2025-10-20", tags: ["親子教室興味"], notes: "お子さん（7歳）と参加希望。", purchases: [
    { id: "p10", serviceName: "初心者パンレッスン〜フォカッチャ〜", amount: 5500, date: "2026-02-15", status: "completed" },
  ], repeatRate: 40, favoriteClassTypes: ["食パン系"], skillLevel: "beginner" },
  { id: "c10", name: "加藤りな", email: "kato@example.com", tier: "trial", totalSpent: 3000, visitCount: 1, lastVisit: "2026-02-22", registeredAt: "2026-02-22", tags: ["体験"], notes: "友人の紹介で参加。", purchases: [
    { id: "p11", serviceName: "はじめてのパン作り体験", amount: 3000, date: "2026-02-22", status: "completed" },
  ], repeatRate: 0, favoriteClassTypes: [], skillLevel: "beginner" },
];

// ─── Contacts ───
export const mockContacts: Contact[] = [
  { id: "ct1", name: "松本真由美", email: "matsumoto@example.com", source: "Instagram", tags: ["パン教室興味"], subscribedAt: "2026-02-10", lastOpened: "2026-02-24" },
  { id: "ct2", name: "井上亮", email: "inoue@example.com", source: "ウェブサイト", tags: ["体験希望"], subscribedAt: "2026-02-15" },
  { id: "ct3", name: "木村さくら", email: "kimura@example.com", source: "LINE", tags: ["天然酵母興味", "体験希望"], subscribedAt: "2026-01-20", lastOpened: "2026-02-20" },
  { id: "ct4", name: "林大介", email: "hayashi@example.com", source: "紹介", tags: ["親子教室興味"], subscribedAt: "2026-02-18" },
  { id: "ct5", name: "清水美穂", email: "shimizu@example.com", source: "Instagram", tags: ["パン教室興味", "クロワッサン"], subscribedAt: "2026-01-05", lastOpened: "2026-02-22" },
  { id: "ct6", name: "森田健太", email: "morita@example.com", source: "ウェブサイト", tags: ["コース興味"], subscribedAt: "2026-02-20" },
  { id: "ct7", name: "藤田あかり", email: "fujita@example.com", source: "LINE", tags: ["体験希望"], subscribedAt: "2026-02-12", lastOpened: "2026-02-25" },
  { id: "ct8", name: "岡田翔", email: "okada@example.com", source: "紹介", tags: ["パン教室興味"], subscribedAt: "2026-02-22" },
];

// ─── Reviews ───
export const mockReviews: Review[] = [
  { id: "r1", serviceId: "s1", serviceName: "初心者パンレッスン〜フォカッチャ〜", customerId: "c1", customerName: "田中美咲", rating: 5, comment: "毎月通っています。先生の指導がとても丁寧で、焼き立てのパンの香りに毎回感動します！フォカッチャのコツがやっと掴めました。", reply: "美咲さん、いつもありがとうございます！フォカッチャ上手になりましたね。次はチャバタに挑戦しましょう！", repliedAt: "2026-02-16", createdAt: "2026-02-15" },
  { id: "r2", serviceId: "s2", serviceName: "クロワッサンマスターコース（全3回）", customerId: "c2", customerName: "佐藤洋平", rating: 5, comment: "折り込み技術が回を重ねるごとに上達していくのが実感できます。材料も良質で、家で再現できるレシピをもらえるのが嬉しい。", createdAt: "2026-02-18" },
  { id: "r3", serviceId: "s4", serviceName: "天然酵母パンレッスン", customerId: "c5", customerName: "高橋裕子", rating: 5, comment: "自家製酵母の育て方から教えてもらえて感激。少人数制なので質問もしやすく、パン作りの奥深さを知りました。", reply: "裕子さん、酵母の管理上手になりましたね！次回は全粒粉を使ったレシピにチャレンジしましょう。", repliedAt: "2026-02-24", createdAt: "2026-02-23" },
  { id: "r4", serviceId: "s3", serviceName: "はじめてのパン作り体験", customerId: "c3", customerName: "山田花子", rating: 4, comment: "初めてのパン作りでしたが、とても楽しかったです！手ごねの感触が気持ちよくて、焼きたてのパンの美味しさに感動しました。", createdAt: "2026-02-19" },
  { id: "r5", serviceId: "s1", serviceName: "初心者パンレッスン〜フォカッチャ〜", customerId: "c7", customerName: "渡辺翔太", rating: 5, comment: "キッチンがとても清潔で、使う材料もこだわりが感じられます。男性一人でも全然気まずくないアットホームな雰囲気が好きです。", createdAt: "2026-02-25" },
  { id: "r6", serviceId: "s4", serviceName: "天然酵母パンレッスン", customerId: "c4", customerName: "鈴木大輝", rating: 4, comment: "天然酵母は初めてでしたが、丁寧に教えてもらえて理解できました。発酵の待ち時間にパンの歴史の話を聞けるのも面白い。", createdAt: "2026-02-20" },
  { id: "r7", serviceId: "s3", serviceName: "はじめてのパン作り体験", customerId: "c10", customerName: "加藤りな", rating: 5, comment: "友達に紹介されて参加。想像以上に楽しくて、次は本格的なレッスンに参加したいです！焼き立てパンを持ち帰れるのも最高。", createdAt: "2026-02-22" },
  { id: "r8", serviceId: "s2", serviceName: "クロワッサンマスターコース（全3回）", customerId: "c6", customerName: "伊藤直子", rating: 3, comment: "内容は良いのですが、定員が少ないので予約が取りにくいです。もう少し枠を増やしていただけると嬉しいです。", createdAt: "2026-02-24" },
];

// ─── Messages ───
export const mockMessages: DistributionMessage[] = [
  { id: "m1", subject: "3月のレッスンスケジュールのお知らせ", content: "{{name}}さん、こんにちは！3月のレッスンスケジュールが決まりました。", channel: "email", status: "sent", recipientCount: 10, openRate: 72, clickRate: 35, sentAt: "2026-02-20", createdAt: "2026-02-19" },
  { id: "m2", subject: "クロワッサンコース残席わずか！", content: "大人気のクロワッサンマスターコース、残り1席です。お早めにご予約ください。", channel: "line", status: "sent", recipientCount: 18, openRate: 88, clickRate: 52, sentAt: "2026-02-22", createdAt: "2026-02-21" },
  { id: "m3", subject: "春の体験レッスンキャンペーン", content: "春の特別キャンペーン。体験レッスンが今だけ2,500円！", channel: "email", status: "scheduled", recipientCount: 28, scheduledAt: "2026-03-01", createdAt: "2026-02-25" },
  { id: "m4", subject: "本日のレッスンありがとうございました！", content: "{{name}}さん、本日はレッスンにご参加いただきありがとうございました。焼き上がりのお写真、ぜひシェアしてくださいね！", channel: "email", status: "draft", recipientCount: 0, createdAt: "2026-02-25" },
];

// ─── Sales ───
export const mockSales: SaleRecord[] = [
  { id: "sl1", date: "2026-02-25", serviceName: "初心者パンレッスン〜フォカッチャ〜", customerName: "田中美咲", paymentMethod: "credit_card", amount: 5500, fee: 198, netAmount: 5302, ingredientCost: 194, profit: 5108, profitMargin: 92.9, status: "completed" },
  { id: "sl2", date: "2026-02-25", serviceName: "初心者パンレッスン〜フォカッチャ〜", customerName: "渡辺翔太", paymentMethod: "credit_card", amount: 5500, fee: 198, netAmount: 5302, ingredientCost: 194, profit: 5108, profitMargin: 92.9, status: "completed" },
  { id: "sl3", date: "2026-02-24", serviceName: "クロワッサンマスターコース（全3回）", customerName: "伊藤直子", paymentMethod: "bank_transfer", amount: 18000, fee: 450, netAmount: 17550, ingredientCost: 525, profit: 17025, profitMargin: 94.6, status: "completed" },
  { id: "sl4", date: "2026-02-23", serviceName: "天然酵母パンレッスン", customerName: "高橋裕子", paymentMethod: "credit_card", amount: 6500, fee: 234, netAmount: 6266, ingredientCost: 261, profit: 6005, profitMargin: 92.4, status: "completed" },
  { id: "sl5", date: "2026-02-22", serviceName: "はじめてのパン作り体験", customerName: "加藤りな", paymentMethod: "convenience_store", amount: 3000, fee: 300, netAmount: 2700, ingredientCost: 150, profit: 2550, profitMargin: 85.0, status: "completed" },
  { id: "sl6", date: "2026-02-21", serviceName: "クロワッサンマスターコース（全3回）", customerName: "佐藤洋平", paymentMethod: "credit_card", amount: 18000, fee: 648, netAmount: 17352, ingredientCost: 525, profit: 16827, profitMargin: 93.5, status: "completed" },
  { id: "sl7", date: "2026-02-20", serviceName: "初心者パンレッスン〜フォカッチャ〜", customerName: "鈴木大輝", paymentMethod: "credit_card", amount: 5500, fee: 198, netAmount: 5302, ingredientCost: 194, profit: 5108, profitMargin: 92.9, status: "completed" },
  { id: "sl8", date: "2026-02-18", serviceName: "はじめてのパン作り体験", customerName: "山田花子", paymentMethod: "credit_card", amount: 3000, fee: 108, netAmount: 2892, ingredientCost: 150, profit: 2742, profitMargin: 91.4, status: "completed" },
  { id: "sl9", date: "2026-02-15", serviceName: "初心者パンレッスン〜フォカッチャ〜", customerName: "高橋裕子", paymentMethod: "credit_card", amount: 5500, fee: 198, netAmount: 5302, ingredientCost: 194, profit: 5108, profitMargin: 92.9, status: "completed" },
  { id: "sl10", date: "2026-02-10", serviceName: "天然酵母パンレッスン", customerName: "田中美咲", paymentMethod: "credit_card", amount: 6500, fee: 234, netAmount: 6266, ingredientCost: 261, profit: 6005, profitMargin: 92.4, status: "completed" },
  { id: "sl11", date: "2026-02-05", serviceName: "初心者パンレッスン〜フォカッチャ〜", customerName: "小林拓也", paymentMethod: "credit_card", amount: 5500, fee: 198, netAmount: 5302, ingredientCost: 194, profit: 5108, profitMargin: 92.9, status: "completed" },
  { id: "sl12", date: "2026-01-25", serviceName: "クロワッサンマスターコース（全3回）", customerName: "佐藤洋平", paymentMethod: "credit_card", amount: 18000, fee: 648, netAmount: 17352, ingredientCost: 525, profit: 16827, profitMargin: 93.5, status: "refunded" },
];

export const mockMonthlySales: MonthlySales[] = [
  { month: "2025-09", revenue: 28000, transactions: 6 },
  { month: "2025-10", revenue: 38500, transactions: 8 },
  { month: "2025-11", revenue: 45000, transactions: 10 },
  { month: "2025-12", revenue: 58000, transactions: 12 },
  { month: "2026-01", revenue: 52000, transactions: 11 },
  { month: "2026-02", revenue: 76500, transactions: 12 },
];

export const mockMonthlyProfit: MonthlyProfit[] = [
  { month: "2025-09", revenue: 28000, ingredientCost: 2100, platformFees: 1008, overhead: 5000, profit: 19892 },
  { month: "2025-10", revenue: 38500, ingredientCost: 2800, platformFees: 1386, overhead: 5000, profit: 29314 },
  { month: "2025-11", revenue: 45000, ingredientCost: 3200, platformFees: 1620, overhead: 5000, profit: 35180 },
  { month: "2025-12", revenue: 58000, ingredientCost: 4100, platformFees: 2088, overhead: 5000, profit: 46812 },
  { month: "2026-01", revenue: 52000, ingredientCost: 3600, platformFees: 1872, overhead: 5000, profit: 41528 },
  { month: "2026-02", revenue: 76500, ingredientCost: 4200, platformFees: 2754, overhead: 5000, profit: 64546 },
];

// ─── Message Templates ───
export const mockMessageTemplates: MessageTemplate[] = [
  { id: "mt1", type: "post-lesson-followup", name: "レッスン後フォロー", subject: "本日のレッスンありがとうございました！", content: "{{name}}さん、本日はレッスンにご参加いただきありがとうございました！\n\n今日作ったパンはいかがでしたか？\n焼き上がりのお写真、ぜひシェアしてくださいね。\n\n次回レッスンのご案内はこちら：{{nextLessonLink}}", channel: "email" },
  { id: "mt2", type: "next-booking-nudge", name: "次回予約誘導", subject: "次回のレッスン、いかがですか？", content: "{{name}}さん、前回のレッスンから少し時間が経ちましたね。\n\nおすすめのレッスンがございます！\n\nご予約はこちら：{{bookingLink}}", channel: "email" },
  { id: "mt3", type: "announcement", name: "お知らせ", subject: "", content: "", channel: "email" },
];

// ─── Kitchen Settings ───
export const mockKitchenSettings: KitchenSettings = {
  maxCapacity: 8,
  defaultLessonDuration: 150,
  ingredientReorderLeadDays: 3,
  defaultOverheadPerLesson: 2500,
  platformFeePercent: 3.6,
};

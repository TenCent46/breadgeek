# BreadGeek プロダクション計画書

> 最終更新: 2026-03-05
> 目標: ITに弱いパン教室の先生が、直感的にオンライン教室を開設・運営できるツール
> MVP範囲: ガイド/AI相談以外のすべての機能

---

## 現状サマリー

### 完成済み
- 認証 (メール認証・パスワードリセット・Resend連携)
- ダッシュボード全ページ (レッスン・予約・顧客・レシピ・材料・売上・利益・レビュー・設定)
- 公開ページ (レッスン検索・教室プロフィール・レッスン詳細)
- オンボーディングUI (4ステップ)
- メール配信 (ターゲット別・テンプレート変数)
- Meilisearch検索
- Prismaスキーマ + DAL + Server Actions (CRUD全般)

### 未完成 (見た目だけ・中身なし)
- 予約フロー (DBに保存されない)
- オンボーディング (DBに永続化されない)
- Stripe決済 (UIトグルのみ)
- 生徒ダッシュボード (ページなし)
- 画像アップロード (S3変数のみ)
- 設定永続化 (口座・通知・特商法がuseStateのみ)
- 売上レコード自動作成
- 予約確認メール
- スケジュール済みメッセージ送信

---

## フェーズ構成

### Phase 1: データ永続化の修復
> 既存UIの裏側を本物にする。見た目は変えず、DBに保存されるようにする。

#### 1-1. オンボーディングの永続化
- [ ] `saveOnboarding` server action を作成
  - slug, name, description, imageUrl, SNSリンク, テーマカラーをSchoolに保存
- [ ] setup-theme の最終ステップで `saveOnboarding` を呼び出し
- [ ] slugの重複チェックをDBレベルで実装（現在はシミュレーションのみ）
- [ ] 完了後 `/dashboard` にリダイレクト

#### 1-2. 設定ページの永続化
- [ ] Prismaスキーマに `SchoolSettings` モデル追加（または既存Schoolモデル拡張）
  - 口座情報: bankName, branchName, accountType, accountNumber, accountHolder
  - 特商法: sellerName, address, phone, email, price, paymentTiming, deliveryTiming, returnPolicy, additionalFees
  - 通知設定: JSON型で各通知のon/off
- [ ] `updateSchoolSettings` server action
- [ ] 設定画面の初期値をDBから読み込み
- [ ] KitchenSettingsの保存は済み（upsert）→ 確認のみ

#### 1-3. プロフィール編集の永続化
- [ ] `updateSchoolProfile` server action (name, description, location, imageUrl)
- [ ] 現在のprofile/edit画面をserver actionに接続

**ファイル影響範囲:**
- `prisma/schema.prisma`
- `src/lib/actions.ts`
- `src/app/(onboarding)/setup-theme/page.tsx`
- `src/app/(dashboard)/dashboard/settings/client.tsx`
- `src/app/(dashboard)/dashboard/profile/edit/client.tsx`

---

### Phase 2: 画像アップロード (Vercel Blob)
> すべての画像アップロードを統一的に処理する基盤。

#### 2-1. Vercel Blob セットアップ
- [ ] `@vercel/blob` パッケージ追加
- [ ] `BLOB_READ_WRITE_TOKEN` 環境変数設定
- [ ] `src/lib/upload.ts` ユーティリティ作成
  - `uploadImage(file: File, folder: string): Promise<string>` → URL返却
  - 画像バリデーション (サイズ上限5MB、形式チェック)
  - 自動リサイズ (next/image最適化で対応)

#### 2-2. アップロードAPI
- [ ] `POST /api/upload` エンドポイント作成
  - 認証チェック
  - Vercel Blobにアップロード
  - URL返却

#### 2-3. 各画面への統合
- [ ] オンボーディング setup-profile: プロフィール画像
- [ ] レッスン作成/編集: レッスンサムネイル (複数枚)
- [ ] レシピ作成/編集: レシピ画像
- [ ] プロフィール編集: 教室画像
- [ ] 既存のbase64データURL → Blob URLへの移行

**ファイル影響範囲:**
- `package.json` (新規依存追加)
- `src/lib/upload.ts` (新規)
- `src/app/api/upload/route.ts` (新規)
- 各フォーム画面のclient.tsx

---

### Phase 3: 予約フロー完全実装
> 生徒がレッスンを予約し、DBに記録され、メール通知が届くまで。

#### 3-1. 生徒アカウント & ゲスト予約
- [ ] Prismaスキーマ: Schoolに `allowGuestBooking` (Boolean, default: false) 追加
- [ ] 予約ページに認証チェック追加
  - ログイン済み → そのまま予約
  - 未ログイン + ゲスト許可 → 名前・メール・電話の入力フォーム
  - 未ログイン + ゲスト不可 → ログイン/登録ページへリダイレクト
- [ ] ゲスト予約時: Customer レコードを自動作成（tier: TRIAL）

#### 3-2. 予約作成 Server Action
- [ ] `createBooking` server action
  - ServiceScheduleの空き枠チェック (spotsTaken < spotsTotal)
  - Booking レコード作成 (status: PENDING or CONFIRMED)
  - ServiceSchedule.spotsTaken を +participants 更新
  - Customer の visitCount, totalSpent, lastVisit 更新
  - 決済方法に応じたステータス設定:
    - 事前決済(Stripe) → PENDING → 決済完了後 CONFIRMED
    - 当日払い → CONFIRMED（即確定）
- [ ] `cancelBooking` server action (生徒側)
  - spotsTaken を減算
  - キャンセルポリシーチェック

#### 3-3. 予約確認メール
- [ ] `sendBookingConfirmationEmail` を mail.ts に追加
  - レッスン名、日時、場所、金額、キャンセルポリシー
- [ ] `sendBookingCancellationEmail`
- [ ] 予約作成時に自動送信
- [ ] 講師への新規予約通知メール

#### 3-4. 予約完了ページ改修
- [ ] `/p/[slug]/complete` をクエリパラメータではなく、実際のBooking IDから表示
- [ ] 予約詳細をDBから取得して表示

**ファイル影響範囲:**
- `prisma/schema.prisma`
- `src/lib/actions.ts` (createBooking, cancelBooking)
- `src/lib/mail.ts` (新メール関数)
- `src/app/(public)/p/[slug]/[id]/client.tsx` (予約フォーム改修)
- `src/app/(public)/p/[slug]/complete/page.tsx` (DB連携)
- `src/app/api/booking/route.ts` (新規、ゲスト予約用)

---

### Phase 4: Stripe決済統合
> 事前決済 + 当日払い選択。Stripe Connect でインストラクターへの支払い。

#### 4-1. Stripe Connect (プラットフォーム型)
- [ ] `stripe` パッケージ追加
- [ ] `src/lib/stripe.ts` ユーティリティ作成
- [ ] Prismaスキーマ: Schoolに `stripeAccountId`, `stripeOnboarded` (Boolean) 追加
- [ ] Stripe Connect Onboarding フロー
  - `POST /api/stripe/connect` → Stripe アカウントリンク生成
  - `GET /api/stripe/connect/callback` → onboarding完了処理
- [ ] 設定画面のStripeトグルを実際の接続フローに変更

#### 4-2. Checkout (事前決済)
- [ ] `POST /api/stripe/checkout` → Stripe Checkout Session作成
  - application_fee_amount でプラットフォーム手数料徴収
  - transfer_data で講師のStripeアカウントへ送金
- [ ] 予約フォームに「事前決済」「当日払い」の選択UI
- [ ] 事前決済選択時 → Stripe Checkout にリダイレクト
- [ ] 当日払い選択時 → 直接予約確定

#### 4-3. Webhook処理
- [ ] `POST /api/stripe/webhook` エンドポイント
  - `checkout.session.completed` → Booking を CONFIRMED に更新
  - `charge.refunded` → Booking を CANCELLED に更新、返金処理
- [ ] Webhook署名検証

#### 4-4. 売上レコード自動作成
- [ ] 決済完了時に SaleRecord を自動作成
  - amount, fee (Stripe手数料), netAmount
  - ingredientCost (linkedRecipeから自動計算)
  - profit, profitMargin 自動計算
- [ ] 当日払いの場合: 講師が手動で「受領済み」マーク → SaleRecord作成

**ファイル影響範囲:**
- `package.json` (stripe追加)
- `prisma/schema.prisma`
- `src/lib/stripe.ts` (新規)
- `src/app/api/stripe/connect/route.ts` (新規)
- `src/app/api/stripe/checkout/route.ts` (新規)
- `src/app/api/stripe/webhook/route.ts` (新規)
- `src/app/(dashboard)/dashboard/settings/client.tsx`
- `src/app/(public)/p/[slug]/[id]/client.tsx`

---

### Phase 5: 生徒側ダッシュボード
> 生徒が自分の予約・履歴・レビューを管理できる画面。

#### 5-1. 生徒ダッシュボード基盤
- [ ] `/student` レイアウト作成 (シンプルなヘッダー + コンテンツ)
- [ ] `requireStudent` ヘルパー作成 (auth-helpers.ts)
- [ ] 生徒用DAL関数 (顧客IDから予約・レビュー取得)

#### 5-2. 予約一覧
- [ ] `/student/bookings` ページ
  - 今後の予約 (日時、レッスン名、場所、ステータス)
  - 過去の予約履歴
  - キャンセルボタン (キャンセルポリシーに基づく)

#### 5-3. レビュー投稿
- [ ] `/student/reviews` ページ
  - 完了済みレッスンへのレビュー投稿フォーム
  - 投稿済みレビュー一覧
- [ ] `addReview` server action
- [ ] レビュー投稿後にDAL経由で教室の平均評価を再計算

#### 5-4. プロフィール
- [ ] `/student/profile` ページ
  - 名前、メール、パスワード変更
  - 通知設定

**ファイル影響範囲:**
- `src/app/(student)/layout.tsx` (新規)
- `src/app/(student)/student/bookings/page.tsx` (新規)
- `src/app/(student)/student/reviews/page.tsx` (新規)
- `src/app/(student)/student/profile/page.tsx` (新規)
- `src/lib/auth-helpers.ts`
- `src/lib/dal/index.ts`
- `src/lib/actions.ts`

---

### Phase 6: メール通知 & スケジュール配信
> 予約関連の自動メールとスケジュール配信。

#### 6-1. トランザクションメール
- [ ] 予約確認メール (生徒向け + 講師向け)
- [ ] 予約リマインダー (レッスン前日) → Vercel Cron
- [ ] キャンセル通知メール
- [ ] 決済完了メール
- [ ] レビュー依頼メール (レッスン翌日) → Vercel Cron

#### 6-2. スケジュール配信
- [ ] Vercel Cron Job (`vercel.json` に cron 設定追加)
- [ ] `GET /api/cron/send-scheduled` エンドポイント
  - status=SCHEDULED かつ scheduledAt <= now のメッセージを取得
  - 対象顧客にメール送信
  - status を SENT に更新
- [ ] `GET /api/cron/send-reminders` エンドポイント
  - 明日の予約を検索
  - リマインダーメール送信

#### 6-3. メールテンプレート管理
- [ ] テンプレートのCRUD server action (現在DALのみ)
- [ ] テンプレート編集UIの接続
- [ ] デフォルトテンプレート自動作成 (教室作成時)

**ファイル影響範囲:**
- `vercel.json` (新規 - cron設定)
- `src/app/api/cron/send-scheduled/route.ts` (新規)
- `src/app/api/cron/send-reminders/route.ts` (新規)
- `src/lib/mail.ts` (テンプレート追加)
- `src/lib/actions.ts` (テンプレートCRUD)

---

### Phase 7: 教室公開ページの強化
> 生徒が教室を見つけ、予約するまでの体験を磨く。

#### 7-1. レッスン検索の強化
- [ ] カテゴリフィルターをDBベースに (現在ハードコード)
- [ ] 地域フィルター追加
- [ ] 価格帯フィルター追加
- [ ] 日程フィルター (空き枠がある日程で絞り込み)
- [ ] ソート (人気順、価格順、日程順)

#### 7-2. 教室プロフィールの強化
- [ ] SNSリンク表示 (現在保存されない)
- [ ] テーマカラー反映 (オンボーディングで選んだ色)
- [ ] ギャラリー表示 (複数画像)
- [ ] 教室の基本情報 (営業時間、アクセス、持ち物など)

#### 7-3. SEO & OGP
- [ ] 各教室ページに動的メタデータ (generateMetadata)
- [ ] OGP画像の自動生成 (または教室画像をOGPに設定)
- [ ] sitemap.xml 自動生成
- [ ] robots.txt

**ファイル影響範囲:**
- `src/app/(public)/lessons/page.tsx`
- `src/app/(public)/p/[slug]/page.tsx`
- `src/app/(public)/p/[slug]/[id]/page.tsx`
- `src/app/sitemap.ts` (新規)
- `src/app/robots.ts` (新規)

---

### Phase 8: ダッシュボード強化
> 既存ダッシュボードの足りない部分を補完。

#### 8-1. 予約管理の強化
- [ ] カレンダービューに実際のスケジュール表示
- [ ] ドラッグ&ドロップでスケジュール変更
- [ ] 予約の手動作成 (講師が電話予約を入力)
- [ ] 当日払いの「受領済み」マーク機能

#### 8-2. 顧客管理の強化
- [ ] 顧客の自動ティア更新ロジック
  - visitCount >= 5 → REPEATER
  - visitCount >= 2 → REGULAR
  - 90日以上来店なし → DORMANT
- [ ] 顧客のインポート/エクスポート (CSV)

#### 8-3. アナリティクスの強化
- [ ] 実データに基づくグラフ (現在の計算ロジックは実装済み)
- [ ] 月次レポートメール (講師向けサマリー)

#### 8-4. スケジュール管理
- [ ] ServiceScheduleの一括作成 (毎週X曜日、N回分)
- [ ] 休講設定
- [ ] スケジュール変更時の予約者への通知

**ファイル影響範囲:**
- `src/lib/actions.ts`
- 各dashboard client.tsx

---

### Phase 9: セキュリティ & 品質
> プロダクションに出す前の最終チェック。

#### 9-1. セキュリティ
- [ ] CSRF対策の確認 (Server Actionsは自動保護)
- [ ] Rate limiting (認証エンドポイント、API)
- [ ] Input validation (zod スキーマ)
- [ ] XSS対策 (メール内容のサニタイズ確認)
- [ ] Stripe Webhook署名検証

#### 9-2. エラーハンドリング
- [ ] グローバルエラーページ (`error.tsx`, `not-found.tsx`)
- [ ] Server Action のエラーレスポンス統一
- [ ] ユーザー向けエラーメッセージ (日本語)
- [ ] Sentry or 類似のエラー監視

#### 9-3. パフォーマンス
- [ ] 画像最適化 (next/image + Vercel Blob)
- [ ] データベースインデックス追加 (頻出クエリ)
- [ ] N+1クエリの確認・修正

#### 9-4. テスト (最低限)
- [ ] 認証フローのE2Eテスト (Playwright)
- [ ] 予約フローのE2Eテスト
- [ ] 決済フローのE2Eテスト
- [ ] Server ActionsのUnit Test (Vitest)

**ファイル影響範囲:**
- `src/app/error.tsx` (新規)
- `src/app/not-found.tsx` (新規)
- `tests/` (新規ディレクトリ)
- `vitest.config.ts` (新規)
- `playwright.config.ts` (新規)

---

## 優先順位マトリクス

| Phase | 重要度 | 依存関係 | 概要 |
|-------|--------|----------|------|
| **1. データ永続化** | 最高 | なし | 既存UIの裏側を本物に |
| **2. 画像アップロード** | 高 | なし | Vercel Blob基盤 |
| **3. 予約フロー** | 最高 | Phase 1, 2 | コア機能 |
| **4. Stripe決済** | 最高 | Phase 3 | 収益化の根幹 |
| **5. 生徒ダッシュボード** | 高 | Phase 3 | 生徒の体験 |
| **6. メール & Cron** | 高 | Phase 3, 4 | 自動化 |
| **7. 公開ページ強化** | 中 | Phase 2 | 集客・SEO |
| **8. ダッシュボード強化** | 中 | Phase 3, 4 | 運営効率 |
| **9. セキュリティ & 品質** | 最高 | 全Phase後 | ローンチ前必須 |

---

## 技術スタック追加

| 技術 | 用途 | Phase |
|------|------|-------|
| `@vercel/blob` | 画像アップロード | 2 |
| `stripe` | 決済処理 | 4 |
| `zod` | バリデーション | 9 |
| `@sentry/nextjs` | エラー監視 | 9 |
| `vitest` | ユニットテスト | 9 |
| `playwright` | E2Eテスト | 9 |

---

## DB スキーマ変更予定

### School モデル拡張
```
allowGuestBooking  Boolean  @default(false)
stripeAccountId    String?
stripeOnboarded    Boolean  @default(false)
themeColor         String   @default("#6B4226")
instagram          String   @default("")
twitter            String   @default("")
youtube            String   @default("")
tiktok             String   @default("")
lineUrl            String   @default("")
```

### SchoolSettings モデル (新規)
```
id                String   @id @default(cuid())
schoolId          String   @unique
bankName          String   @default("")
branchName        String   @default("")
accountType       String   @default("")
accountNumber     String   @default("")
accountHolder     String   @default("")
legalSellerName   String   @default("")
legalAddress      String   @default("")
legalPhone        String   @default("")
legalEmail        String   @default("")
legalPrice        String   @default("")
legalPaymentTiming String  @default("")
legalDeliveryTiming String @default("")
legalReturnPolicy  String  @default("")
legalAdditionalFees String @default("")
notifications     Json     @default("{}")
```

---

## 実装順序 (ユーザー価値順)

> 「パン教室の先生が初めてデモを見たとき、どの順番で心が動くか」で優先度を決定。
> 各ステップが完了するたびにデモ可能な状態になるよう設計。

### Step 1: 「5分で自分の教室ページが作れる！」
**オンボーディング永続化 + 画像アップロード + 公開ページ反映**

先生が最初に体験する瞬間。名前を入れて、写真を選んで、色を決めたら
自分だけの教室ページが出来上がる。この「おおっ！」が最も重要。

- Phase 1-1: オンボーディング → DB保存
- Phase 2: Vercel Blob画像アップロード
- Phase 7-2: テーマカラー・SNS・画像の公開ページ反映
- Phase 1-3: プロフィール編集の永続化

**デモポイント:** URL入力→写真アップ→色選択→「公開！」→ 実際にスマホで見せる

---

### Step 2: 「レッスンを作って生徒が予約できる！」
**予約フロー完全実装 + 確認メール**

教室ページの次は「レッスンを出す→生徒が予約する」体験。
これが動いた瞬間に「本当に教室ができた」と実感する。

- Phase 3-1: 生徒アカウント & ゲスト予約
- Phase 3-2: 予約作成 Server Action (空き枠管理)
- Phase 3-3: 予約確認メール (生徒+講師)
- Phase 3-4: 予約完了ページ改修

**デモポイント:** スマホで自分の教室を開く→レッスン選ぶ→予約する→メールが届く

---

### Step 3: 「お金もちゃんと受け取れる！」
**Stripe決済 + 売上自動記録**

予約ができたら次は「お金」。カード決済も当日払いも選べて、
売上が自動でダッシュボードに並ぶ。

- Phase 4-1: Stripe Connect (講師のアカウント接続)
- Phase 4-2: Checkout (事前決済 / 当日払い選択)
- Phase 4-3: Webhook処理
- Phase 4-4: 売上レコード自動作成
- Phase 1-2: 設定ページ永続化 (口座・特商法)

**デモポイント:** 実際にテスト決済→ダッシュボードに売上表示→「月10万円見込み」

---

### Step 4: 「生徒さんの管理も全部ここで！」
**生徒ダッシュボード + 顧客管理強化**

リピーター管理・生徒側の体験を作る。
「この子最近来てないな」「あの人はリピーターだ」が一目でわかる。

- Phase 5: 生徒ダッシュボード全体
- Phase 8-2: 顧客の自動ティア更新・CSV入出力
- Phase 8-1: 予約管理強化 (手動作成、受領マーク)

**デモポイント:** 顧客一覧→「休眠生徒にメール送ろう」→メッセージ配信画面へ

---

### Step 5: 「メールも自動で送ってくれる！」
**スケジュール配信 + 自動通知 + リマインダー**

手動でメール打たなくても、リマインダーやフォローアップが自動で飛ぶ。

- Phase 6-1: トランザクションメール全種
- Phase 6-2: Vercel Cron (スケジュール配信 + リマインダー)
- Phase 6-3: テンプレート管理

**デモポイント:** 「明日のレッスンのリマインダーが自動で届きますよ」

---

### Step 6: 「生徒が見つけてくれる！」
**SEO・検索・公開ページの磨き上げ**

教室を作っても見つけてもらえなきゃ意味がない。
検索・フィルター・OGPで集客力を上げる。

- Phase 7-1: レッスン検索強化 (地域・価格・日程フィルター)
- Phase 7-3: SEO & OGP (メタデータ・sitemap・OGP画像)
- Phase 8-3: アナリティクス強化
- Phase 8-4: スケジュール管理 (一括作成・休講)

**デモポイント:** Googleで「パン教室 渋谷」→自分の教室が出る

---

### Step 7: 「安心して使える！」
**セキュリティ・品質・テスト**

ローンチ前の最終品質保証。

- Phase 9 全体

---

## 将来対応 (MVP後)

- LINE公式アカウント連携 (配信・予約通知) ← 優先度高
- アプリ内ガイド/ウィザード (新規教室開設サポート)
- AI相談機能 (価格設定・メニュー提案)
- Zoom連携 (ミーティングURL自動発行)
- Google Calendar同期
- 多言語対応
- モバイルアプリ (PWA or React Native)

# MOSH クローンサイト構築プロンプト（Claude Code用）

## 概要

MOSHと同等の機能を持つ、個人クリエイター向けサービス販売プラットフォームをゼロから構築してください。MOSHは個人の専門家やクリエイターが、自分の技術・知識・経験をオリジナルのサービスとしてオンラインで販売できるプラットフォームです。予約機能付きホームページ作成、オンライン決済、顧客管理まで一貫して行えるサービスです。

---

## 技術スタック

- **フロントエンド**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes (Route Handlers)
- **データベース**: PostgreSQL + Prisma ORM
- **認証**: NextAuth.js（メール/パスワード、LINE、Facebook OAuth対応）
- **決済**: Stripe Connect
- **ファイルストレージ**: AWS S3 または Cloudflare R2
- **リアルタイム通信**: Pusher または Socket.io（メッセージ機能用）
- **メール配信**: SendGrid または Resend
- **ビデオ通話連携**: Zoom API
- **カレンダー連携**: Google Calendar API
- **デプロイ**: Vercel

---

## 全体アーキテクチャ

```
/
├── app/
│   ├── (auth)/                    # 認証関連ページ
│   │   ├── login/
│   │   ├── register/
│   │   └── verify-email/
│   ├── (onboarding)/              # 初期設定ウィザード
│   │   ├── setup-url/
│   │   ├── setup-profile/
│   │   ├── setup-sns/
│   │   └── setup-theme/
│   ├── (dashboard)/               # クリエイターダッシュボード
│   │   ├── dashboard/
│   │   ├── services/
│   │   ├── bookings/
│   │   ├── customers/
│   │   ├── messages/
│   │   ├── analytics/
│   │   ├── coupons/
│   │   ├── blog/
│   │   ├── page-builder/
│   │   ├── workflows/
│   │   ├── member-site/
│   │   └── settings/
│   ├── (public)/                  # 公開ページ
│   │   └── [username]/            # クリエイタープロフィール
│   │       ├── page.tsx
│   │       └── [serviceSlug]/     # サービス詳細・予約
│   └── api/                       # API Routes
├── components/
├── lib/
├── prisma/
└── public/
```

---

## Phase 1: 会員登録〜オンボーディングフロー（最優先で実装）

### 1-1. 会員登録ページ (`/register`)

**デザイン仕様:**
- 背景色: `#F5F5F5`（ライトグレー）
- ロゴ: 左上に配置。ロゴはピンク/コーラル系（`#FF6B6B`）の炎アイコン + サービス名テキスト
- フォーム: 中央配置、白背景カード（`border-radius: 12px`, `box-shadow: 0 2px 8px rgba(0,0,0,0.08)`）
- 最大幅: `480px`

**登録方法（3種類）:**
1. **メールアドレス + パスワード**: メールアドレス入力フィールド、パスワード入力フィールド（8文字以上）、「アカウントを作成」ボタン（黒背景、白テキスト、角丸`8px`、幅100%）
2. **LINEログイン**: LINE公式グリーン（`#06C755`）のボタン、LINEアイコン付き
3. **Facebookログイン**: Facebookブルー（`#1877F2`）のボタン、Facebookアイコン付き

**バリデーション:**
- メールアドレス: RFC準拠のフォーマットチェック
- パスワード: 最低8文字
- 既存アカウントの重複チェック
- エラーメッセージは赤色（`#E53E3E`）でフィールド下に表示

**登録後フロー:**
- 確認メール送信 → メール内の「メールアドレス認証を完了する」ボタンクリック → 認証完了 → オンボーディング画面へリダイレクト

---

### 1-2. オンボーディングウィザード（4ステップ）

**共通レイアウト仕様:**

```
┌──────────────────────────────────────────────────────────┐
│ [ロゴ]                                                    │
│                                                          │
│    ◉──────◎──────○──────○                               │
│  URLを決める  基本情報  SNS追加  テーマ選択                    │
│                                                          │
│  ┌─────────────────────┐  ┌──────────────────┐          │
│  │                     │  │  [モバイル        │          │
│  │  フォームエリア       │  │   プレビュー]     │          │
│  │  (左側 60%)         │  │  (右側 40%)      │          │
│  │                     │  │                  │          │
│  └─────────────────────┘  └──────────────────┘          │
│                                                          │
│          [スキップ]  [次へ進むボタン]                        │
└──────────────────────────────────────────────────────────┘
```

**ステッパーコンポーネントの仕様:**
- 4つのステップを横並びで表示
- 各ステップ間は直線で接続
- ステップの状態:
  - **完了**: 黒い円の中に白いチェックマーク（✓）、接続線は黒い実線
  - **現在のステップ**: 黒い円の中に白い丸（二重円デザイン）、接続線は点線（グレー）
  - **未完了**: グレーの点（小さい丸）、接続線は点線（グレー）
- 各ステップ下にラベルテキスト（`font-size: 14px`, `color: #333`）
- ステップ名: 「URLを決める」「基本情報」「SNS追加」「テーマ選択」

**右側モバイルプレビューの仕様:**
- 背景: ピンク/コーラル系のグラデーション背景（`#FF6B81` → `#FF8E9E`）
- 中央にスマートフォンモックアップ（白いiPhoneフレーム、角丸`24px`）
- モックアップ内にリアルタイムプレビューを表示
- プレビュー内容はフォーム入力に連動してリアルタイム更新
- モックアップのサイズ: 幅`280px`程度、高さ`560px`程度

---

### Step 1: URLを決める (`/onboarding/setup-url`)

**フォーム内容:**
- 見出し: 「あなたのURLを決めましょう」（`font-size: 28px`, `font-weight: bold`）
- 説明文: 「プロフィールリンクの基盤となるURLです。後からも変更可能です。」（`font-size: 16px`, `color: #666`）
- URL入力フィールド:
  - プレフィックス表示: `https://[サービス名].com/` （グレー背景、読み取り専用）
  - 入力エリア: ユーザー名部分（半角英数字、ハイフン、アンダースコアのみ）
  - リアルタイムバリデーション: 使用可能なら緑色チェック、不可なら赤色バツ
  - 文字数制限: 3〜30文字
- ボタン: 「このURLに決定 ＞」（黒背景、白テキスト、`padding: 14px 32px`, `border-radius: 8px`）

**右側プレビュー:**
- スマホモックアップ内にURL表示のイメージ

---

### Step 2: 基本情報（プロフィール作成）(`/onboarding/setup-profile`)

**これがスクリーンショット1〜3に該当するページです。**

**見出し:**
- タイトル: 「プロフィールを作りましょう」（`font-size: 28px`, `font-weight: bold`, `color: #1A1A1A`）
- サブテキスト: 「プロフィールは後からも変更可能です。」（`font-size: 16px`, `color: #666`）

**フォーム内容:**

#### プロフィール写真セクション
- ラベル: 「プロフィール写真」（`font-size: 16px`, `font-weight: bold`）
- 説明テキスト（ラベル下に縦並び）:
  ```
  ドラッグ＆ドロップ、
  またはファイルを選択できます。
  形式: jpg, png, webp
  推奨サイズ: 1280 x 1280 px
  ファイル容量: 最大100MB
  ```
  - `font-size: 14px`, `color: #888`, `line-height: 1.8`
- 右側にプレースホルダー画像（グレー背景の丸い円に人物シルエットアイコン）
  - サイズ: `width: 120px`, `height: 120px`
  - 背景: `#E8E8E8`、ボーダー: なし
  - アイコン: グレー（`#BDBDBD`）の人物シルエット
- クリックまたはドラッグ&ドロップでファイルアップロード
- アップロード後: 円形にクロップされた画像を表示

#### 活動名フィールド
- ラベル: 「活動名」（`font-size: 16px`, `font-weight: bold`）
- 右端にカウンター: 「4/50」形式（`font-size: 14px`, `color: #999`）
- 入力フィールド:
  - `border: 1px solid #E0E0E0`
  - `border-radius: 8px`
  - `padding: 14px 16px`
  - `font-size: 16px`
  - プレースホルダー: なし（空欄）
  - 最大50文字
  - フォーカス時: `border-color: #333`

#### 肩書・キャッチコピーフィールド
- ラベル: 「肩書・キャッチコピーなど」（`font-size: 16px`, `font-weight: bold`）
- 右端にカウンター: 「0/50」
- 入力フィールド:
  - 同上のスタイル
  - プレースホルダー: 「あなたの活動内容を入力...」（`color: #BDBDBD`）
  - 最大50文字

#### ボタン
- 「この内容で作成 ＞」（黒背景`#1A1A1A`、白テキスト、`padding: 14px 32px`, `border-radius: 8px`, `font-size: 16px`）
- 中央揃え

**右側モバイルプレビュー（リアルタイム更新）:**
- スマホフレーム内の表示内容:
  - 上部: プロフィール写真（大きめの円形、未設定時はグレーのシルエットアイコン）
  - その下: 薄いグレーテキスト「あなたの提供するサービスやご活動内容」
  - その下: 活動名（太字、大きめフォント `font-size: 24px`）
  - 活動名の上に肩書テキスト（小さめフォント `font-size: 14px`）
- 入力に連動してリアルタイム更新される

---

### Step 3: SNS追加 (`/onboarding/setup-sns`)

**これがスクリーンショット4に該当するページです。**

**見出し:**
- タイトル: 「表示するSNSアカウントを追加しましょう」（`font-size: 28px`, `font-weight: bold`）
- サブテキスト: 「普段発信しているSNSやサイトを載せると、ゲストがあなたをより深く知ることができます。」（`font-size: 16px`, `color: #666`, `max-width: 480px`）

**SNS入力フォーム（縦並びリスト）:**

各SNSは以下のレイアウト:
```
[SNSアイコン(40x40)] [テキスト入力フィールド]
```

対応するSNS一覧（上から順に）:
1. **Instagram**: アイコン（グラデーション紫→オレンジ→黄色の角丸正方形、白いカメラアイコン）、プレースホルダー: なし
2. **X (Twitter)**: アイコン（黒背景の角丸正方形、白いXロゴ）、プレースホルダー: 「ユーザーID、またはプロフィールURLを入力...」
3. **YouTube**: アイコン（赤い角丸正方形`#FF0000`、白い再生ボタン）、プレースホルダー: 「@チャンネルID、またはチャンネルURLを入力...」
4. **LINE**: アイコン（緑`#06C755`の角丸正方形、白いLINEロゴ）、プレースホルダー: 「友だち追加URLを入力...」
5. **TikTok**: アイコン（黒背景の角丸正方形、TikTokロゴ）、プレースホルダー: 「@ユーザーID、またはプロフィールURLを入力...」

- アイコンサイズ: `40px × 40px`, `border-radius: 10px`
- フィールドスタイル: `border: 1px solid #E0E0E0`, `border-radius: 8px`, `padding: 12px 16px`, `font-size: 14px`
- リストはスクロール可能（右端に薄いグレーのスクロールバー表示）
- 上下の矢印アイコン（`▲` `▼`）でスクロール可能なことを示す

**ボタン:**
- 「スキップ」テキストリンク（`color: #666`, `font-size: 14px`）— 左側
- 「SNSを追加 ＞」ボタン（黒背景、白テキスト）— 右側
- 2つは横並びで中央揃え

**右側モバイルプレビュー:**
- プロフィール写真 + 肩書 + 活動名の下にSNSカードが表示
- SNSカード: 白背景、角丸`12px`、薄いシャドウ
  - 左にSNSアイコン
  - 右にSNS名（例: 「Instagram」）
  - その下にサブテキスト（例: 「Instagramアカウントを作...」）

---

### Step 4: テーマ選択 (`/onboarding/setup-theme`)

**これがスクリーンショット5に該当するページです。**

**見出し:**
- タイトル: 「ページのテーマを選びましょう」（`font-size: 28px`, `font-weight: bold`）
- サブテキスト: 「あなたの活動に合うデザインをテンプレートから選びます。後から変更もできます。」（`font-size: 16px`, `color: #666`）

**テーマタイプ切り替えタブ:**
- 3つのタブを横並び:
  1. 「🔲 単色」（選択時: 下線、太字）
  2. 「🔲 グラデーション」
  3. 「🔲 画像」
- タブスタイル: `padding: 10px 24px`, `font-size: 14px`
- 選択中タブ: `border-bottom: 2px solid #333`, `font-weight: bold`
- 非選択タブ: `color: #999`

**「単色」タブのカラーグリッド:**
- 3行 × 5列のカラースウォッチ + カスタムカラーピッカー（計16個）
- 各スウォッチ: `width: 80px`, `height: 80px`, `border-radius: 8px`
- スウォッチ間のギャップ: `16px`
- 選択中のスウォッチ: `border: 3px solid #1A1A1A`（黒い太枠）
- 非選択のスウォッチ: `border: 1px solid #E8E8E8`

カラーパレット（左上から右下へ）:
```
行1: #FFFFFF(白), #F5F5F5(明るいグレー), #E8E8E8(グレー), #F0EDE8(ベージュ), #F5F0E0(クリーム)
行2: #D4C5A9(サンド), #C4B69C(ダークサンド), #BFA98A(キャメル), #F0E68C(ペールイエロー), #F8C8D4(ペールピンク)
行3: #C8E6C9(ペールグリーン), #C8D8E8(ペールブルー), #E0C8E8(ペールパープル), #2C3E50(ダークネイビー), 🎨(カスタムカラーピッカー)
```

- カスタムカラーピッカー: パレットアイコン、クリックでカラーピッカーモーダル表示

**「グラデーション」タブ:**
- 同じグリッドレイアウトでグラデーションの選択肢を表示
- 各スウォッチが2色のグラデーション

**「画像」タブ:**
- プリセット画像のサムネイルグリッド
- カスタム画像アップロードボタン

**ボタン:**
- 「スキップ」テキストリンク — 左側
- 「このテーマで決定」ボタン（黒背景、白テキスト）— 右側

**右側モバイルプレビュー:**
- 選択したテーマカラーがリアルタイムでプレビューに反映
- 背景色がテーマカラーに変更される
- プロフィール情報（写真、肩書、活動名、SNSカード）が表示される

---

## Phase 2: ダッシュボード

### 2-1. ダッシュボードレイアウト

**サイドバー（左側、幅`240px`）:**
- 背景: 白（`#FFFFFF`）
- ロゴ: 上部に配置
- ナビゲーションメニュー（アイコン + テキスト）:
  - ホーム
  - サービス管理
  - 予約管理
  - 顧客管理
  - メッセージ
  - 分析
  - クーポン
  - ブログ
  - ページビルダー
  - ワークフロー
  - 会員サイト
  - 設定
- アクティブ項目: `background: #F5F5F5`, `font-weight: bold`
- ホバー: `background: #FAFAFA`

**メインコンテンツエリア:**
- 背景: `#F8F8F8`
- `padding: 24px 32px`
- 上部にパンくずリスト + ページタイトル

### 2-2. ホーム画面

- 売上サマリーカード（今月の売上、先月比）
- 直近の予約一覧
- 未読メッセージ数
- クイックアクションボタン（新規サービス作成、ブログ投稿など）

### 2-3. サービス管理

**サービス作成フロー:**

5つのサービスタイプから選択:
1. **クラス・イベント開催（イベント型）**: 大人数向けレッスン・ワークショップ
2. **プライベート予約（プライベート型）**: 1対1の施術・レッスン
3. **オンライン開催**: Zoom連携のオンラインレッスン
4. **サブスクリプション**: 月額・年額の定期課金サービス
5. **講座・コンテンツ販売**: デジタルコンテンツ販売

**サービスページ作成フォーム:**
- サービスタイトル（最大80文字）
- サービス説明文（リッチテキストエディタ、最大5,000文字）
- カバー画像（複数枚アップロード可、スライダー表示）
- 料金設定（一回料金、月額料金、回数券など）
- 開催日時設定（カレンダーUI）
- 定員設定
- 開催場所（対面の場合：住所入力、オンラインの場合：Zoom自動発行）
- キャンセルポリシー設定
- 公開/非公開切り替え

**サービス一覧ページ:**
- カード型レイアウトでサービスを表示
- 各カードにサービス名、料金、予約数、ステータス
- 並び替え・フィルター機能
- サービスの編集・複製・削除

### 2-4. 予約管理

**カレンダービュー:**
- 月表示 / 週表示 / 日表示の切り替え
- 各日付に予約件数のバッジ表示
- 予約をクリックで詳細モーダル表示

**予約リストビュー:**
- テーブル形式（日時、サービス名、顧客名、ステータス、金額）
- ステータス: 確定、キャンセル待ち、キャンセル済み
- フィルター: サービス別、期間別、ステータス別
- CSV エクスポート

**予約詳細:**
- 顧客情報
- サービス情報
- 決済情報
- キャンセル/変更操作
- メッセージ送信ボタン

### 2-5. 顧客管理

**顧客リスト:**
- テーブル形式（名前、メール、登録日、最終利用日、累計購入金額、ステータス）
- 検索・フィルター機能
- タグ付け機能
- CSV エクスポート/インポート

**顧客詳細ページ:**
- 基本情報
- 予約履歴
- 決済履歴
- メッセージ履歴
- メモ欄

**インサイトアナリティクス:**
- ファンの熱量を4段階で可視化:
  1. コアファン（リピート率高、高単価）
  2. レギュラー（定期的に利用）
  3. トライアル（初回〜数回利用）
  4. 休眠（一定期間利用なし）
- 各セグメントの人数・推移グラフ

### 2-6. メッセージ機能

**個別メッセージ:**
- LINEライクなチャットUI
- テキスト送信
- ファイル添付
- 既読/未読表示

**一斉配信:**
- 配信先の選択（全顧客、タグ別、セグメント別）
- テンプレート機能
- 配信予約（日時指定）
- 配信実績の確認（開封率、クリック率）

### 2-7. 売上・分析

**売上ダッシュボード:**
- 月次/週次/日次の売上推移グラフ
- サービス別売上ランキング
- 決済方法別の内訳
- 出金履歴

**アクセス分析:**
- ページビュー推移
- 流入元（SNS別）
- コンバージョン率

### 2-8. クーポン管理

- クーポンコード作成（割引率 or 固定金額）
- 有効期限設定
- 利用回数制限
- 対象サービス指定
- 利用実績の確認

### 2-9. ブログ機能

- リッチテキストエディタ（見出し、太字、画像、リンク対応）
- 下書き保存/公開
- カバー画像設定
- カテゴリ・タグ設定
- 公開日時の予約投稿

### 2-10. ページビルダー

- ドラッグ&ドロップでランディングページ作成
- テンプレートから選択
- ブロックタイプ: ヒーロー、テキスト、画像、動画、CTA、料金表、FAQ、お客様の声
- プレビュー機能（モバイル/デスクトップ切り替え）
- 公開URL設定

### 2-11. ワークフロー（自動化）

- トリガー設定（予約確定時、購入完了時、◯日後など）
- アクション設定（メール送信、LINE配信、タグ付与）
- ワークフローの有効/無効切り替え
- 実行ログの確認

### 2-12. 会員サイト

- 購入者専用のコンテンツ配信ページ
- コンテンツタイプ: 動画、URL、音声、ブログ記事、掲示板
- コミュニティ機能（掲示板形式の投稿・コメント）
- アクセス制御（購入者のみ閲覧可能）

---

## Phase 3: 公開プロフィールページ

### 3-1. プロフィールリンクページ (`/[username]`)

**レイアウト:**
- モバイルファースト設計
- 背景: テーマカラー（ユーザーが選択した色）
- 中央寄せのカード型レイアウト

**コンテンツ構成（上から順に）:**
1. プロフィール画像（大きめの円形、中央配置）
2. 肩書・キャッチコピー（`font-size: 14px`, `color: #666`）
3. 活動名（`font-size: 28px`, `font-weight: bold`）
4. SNSリンクカード（各SNSのアイコン + サービス名）
5. サービス一覧（カード形式）
6. ブログ記事一覧
7. プロフィール文

### 3-2. サービス詳細ページ (`/[username]/[serviceSlug]`)

- サービス画像スライダー
- サービスタイトル・料金
- 説明文（リッチテキスト）
- 開催日時カレンダー
- 予約ボタン（「予約する」）
- お客様の感想
- キャンセルポリシー

### 3-3. 予約・決済フロー

1. 日時選択
2. 顧客情報入力（名前、メール、電話番号）
3. 決済方法選択（クレジットカード / 銀行振込 / 当日現地支払い）
4. Stripe Checkout画面（クレジットカードの場合）
5. 予約完了画面 + 確認メール送信

---

## Phase 4: 設定画面

### 4-1. アカウント設定
- 基本情報（名前、メール、パスワード変更）
- プロフィール編集（写真、活動名、肩書、プロフィール文）
- SNS連携管理
- テーマ変更

### 4-2. 事業者情報
- 事業者名
- 住所
- 電話番号
- 事業形態（個人/法人）

### 4-3. 本人確認
- 本人確認書類アップロード（運転免許証、パスポートなど）
- 審査ステータス表示

### 4-4. 口座情報
- 銀行名、支店名、口座種別、口座番号、口座名義
- 振込スケジュール表示（毎月25日）

### 4-5. 特定商取引法に基づく表記
- 販売業者名、所在地、電話番号、メールアドレス等
- 自動生成テンプレート付き

### 4-6. 外部連携
- Zoom連携（OAuth）
- Googleカレンダー連携（OAuth）
- LINE公式アカウント連携

### 4-7. 通知設定
- メール通知のON/OFF（予約時、キャンセル時、メッセージ受信時など）
- LINE通知のON/OFF

---

## Phase 5: API・決済基盤

### 5-1. Stripe Connect実装

```
売上フロー:
顧客 → Stripe決済 → プラットフォーム手数料差引 → クリエイター口座へ振込
```

- Connected Accountの作成（クリエイターごと）
- Payment Intent作成
- Webhook処理（決済成功、失敗、返金）
- 手数料計算: 決済手数料3.5% + サービス利用料3.0% + 99円
- 毎月25日の自動振込（Stripe Payouts）

### 5-2. 回数券・サブスク

- Stripe Subscriptions（サブスク用）
- メタデータに回数券の残回数を管理
- 分割決済対応

### 5-3. Zoom API連携

- OAuth2.0認証
- ミーティング自動作成
- ミーティングURL発行
- 24時間前リマインドメール自動送信

### 5-4. Google Calendar API連携

- OAuth2.0認証
- イベント自動作成
- カレンダー同期

---

## データベーススキーマ（Prisma）

```prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  passwordHash    String?
  name            String?
  username        String   @unique
  profileImage    String?
  title           String?  // 肩書・キャッチコピー
  bio             String?  @db.Text
  themeType       String   @default("solid") // solid, gradient, image
  themeColor      String   @default("#FFFFFF")
  themeGradient   String?
  themeImage      String?
  role            UserRole @default(CREATOR)
  emailVerified   DateTime?
  lineId          String?
  facebookId      String?
  stripeAccountId String?
  zoomAccessToken String?
  googleCalendarToken String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  socialLinks     SocialLink[]
  services        Service[]
  bookings        Booking[]
  customers       Customer[]
  messages        Message[]
  coupons         Coupon[]
  blogPosts       BlogPost[]
  pages           Page[]
  workflows       Workflow[]
  memberSites     MemberSite[]
  businessInfo    BusinessInfo?
  bankAccount     BankAccount?
}

model SocialLink {
  id        String   @id @default(cuid())
  userId    String
  platform  SocialPlatform
  username  String
  url       String?
  order     Int      @default(0)
  user      User     @relation(fields: [userId], references: [id])
}

model Service {
  id              String      @id @default(cuid())
  userId          String
  title           String
  slug            String
  description     String?     @db.Text
  type            ServiceType
  price           Int
  currency        String      @default("JPY")
  duration        Int?        // 分
  capacity        Int?        // 定員
  location        String?
  isOnline        Boolean     @default(false)
  zoomMeetingId   String?
  images          String[]
  cancelPolicy    String?     @db.Text
  isPublished     Boolean     @default(false)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  user            User        @relation(fields: [userId], references: [id])
  schedules       Schedule[]
  bookings        Booking[]
  subscriptions   Subscription[]
  tickets         Ticket[]

  @@unique([userId, slug])
}

model Schedule {
  id          String   @id @default(cuid())
  serviceId   String
  startTime   DateTime
  endTime     DateTime
  isRecurring Boolean  @default(false)
  recurrence  String?  // RRULE形式
  service     Service  @relation(fields: [serviceId], references: [id])
  bookings    Booking[]
}

model Booking {
  id            String        @id @default(cuid())
  serviceId     String
  scheduleId    String?
  customerId    String
  userId        String
  status        BookingStatus @default(PENDING)
  paymentMethod PaymentMethod
  amount        Int
  stripePaymentId String?
  cancelledAt   DateTime?
  cancelReason  String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  service       Service       @relation(fields: [serviceId], references: [id])
  schedule      Schedule?     @relation(fields: [scheduleId], references: [id])
  customer      Customer      @relation(fields: [customerId], references: [id])
  user          User          @relation(fields: [userId], references: [id])
}

model Customer {
  id            String    @id @default(cuid())
  userId        String
  email         String
  name          String
  phone         String?
  tags          String[]
  note          String?   @db.Text
  totalSpent    Int       @default(0)
  lastVisitAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  user          User      @relation(fields: [userId], references: [id])
  bookings      Booking[]
  messages      Message[]
  subscriptions Subscription[]

  @@unique([userId, email])
}

model Subscription {
  id            String    @id @default(cuid())
  serviceId     String
  customerId    String
  stripeSubId   String?
  status        SubStatus @default(ACTIVE)
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  cancelledAt   DateTime?
  createdAt     DateTime  @default(now())

  service       Service   @relation(fields: [serviceId], references: [id])
  customer      Customer  @relation(fields: [customerId], references: [id])
}

model Ticket {
  id          String  @id @default(cuid())
  serviceId   String
  customerId  String
  totalCount  Int
  usedCount   Int     @default(0)
  expiresAt   DateTime?
  service     Service @relation(fields: [serviceId], references: [id])
}

model Message {
  id          String   @id @default(cuid())
  userId      String
  customerId  String
  content     String   @db.Text
  isFromUser  Boolean  @default(true)
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])
  customer    Customer @relation(fields: [customerId], references: [id])
}

model Coupon {
  id            String   @id @default(cuid())
  userId        String
  code          String
  discountType  DiscountType // PERCENTAGE or FIXED
  discountValue Int
  maxUses       Int?
  usedCount     Int      @default(0)
  expiresAt     DateTime?
  serviceIds    String[]
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())

  user          User     @relation(fields: [userId], references: [id])

  @@unique([userId, code])
}

model BlogPost {
  id          String   @id @default(cuid())
  userId      String
  title       String
  slug        String
  content     String   @db.Text
  coverImage  String?
  tags        String[]
  isPublished Boolean  @default(false)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id])

  @@unique([userId, slug])
}

model Page {
  id          String   @id @default(cuid())
  userId      String
  title       String
  slug        String
  blocks      Json     // ページビルダーのブロックデータ
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id])
}

model Workflow {
  id          String   @id @default(cuid())
  userId      String
  name        String
  trigger     Json     // トリガー条件
  actions     Json     // アクション定義
  isActive    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id])
}

model MemberSite {
  id          String   @id @default(cuid())
  userId      String
  serviceId   String
  contents    Json     // コンテンツリスト
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id])
}

model BusinessInfo {
  id            String  @id @default(cuid())
  userId        String  @unique
  businessName  String
  address       String
  phone         String
  businessType  String  // individual or corporation
  idVerified    Boolean @default(false)
  idDocumentUrl String?

  user          User    @relation(fields: [userId], references: [id])
}

model BankAccount {
  id            String  @id @default(cuid())
  userId        String  @unique
  bankName      String
  branchName    String
  accountType   String  // ordinary or current
  accountNumber String
  accountHolder String

  user          User    @relation(fields: [userId], references: [id])
}

enum UserRole {
  CREATOR
  ADMIN
}

enum SocialPlatform {
  INSTAGRAM
  X
  YOUTUBE
  LINE
  TIKTOK
  FACEBOOK
  WEBSITE
}

enum ServiceType {
  CLASS_EVENT     // クラス・イベント
  PRIVATE         // プライベート予約
  ONLINE          // オンライン開催
  SUBSCRIPTION    // サブスクリプション
  CONTENT         // 講座・コンテンツ販売
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  WAITLISTED
  COMPLETED
}

enum PaymentMethod {
  CREDIT_CARD
  BANK_TRANSFER
  ON_SITE
}

enum SubStatus {
  ACTIVE
  CANCELLED
  PAST_DUE
  PAUSED
}

enum DiscountType {
  PERCENTAGE
  FIXED
}
```

---

## デザインシステム

### カラーパレット
```css
/* Primary */
--primary: #1A1A1A;        /* メインボタン、見出し */
--primary-hover: #333333;

/* Accent */
--accent: #FF6B6B;         /* ロゴ、アクセント */
--accent-light: #FF8E9E;

/* Background */
--bg-primary: #FFFFFF;
--bg-secondary: #F5F5F5;
--bg-tertiary: #F8F8F8;

/* Text */
--text-primary: #1A1A1A;
--text-secondary: #666666;
--text-tertiary: #999999;
--text-placeholder: #BDBDBD;

/* Border */
--border: #E0E0E0;
--border-light: #E8E8E8;

/* Status */
--success: #48BB78;
--warning: #ECC94B;
--error: #E53E3E;
--info: #4299E1;
```

### タイポグラフィ
```css
/* フォント */
font-family: 'Noto Sans JP', 'Hiragino Sans', sans-serif;

/* サイズ */
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 28px;
--text-4xl: 32px;

/* 行間 */
line-height: 1.6; /* 本文 */
line-height: 1.3; /* 見出し */
```

### コンポーネントスタイル
```css
/* ボタン（プライマリ） */
background: #1A1A1A;
color: white;
padding: 14px 32px;
border-radius: 8px;
font-size: 16px;
font-weight: 500;
transition: background 0.2s;
/* ホバー */
background: #333333;

/* 入力フィールド */
border: 1px solid #E0E0E0;
border-radius: 8px;
padding: 14px 16px;
font-size: 16px;
/* フォーカス */
border-color: #1A1A1A;
outline: none;
box-shadow: 0 0 0 2px rgba(26, 26, 26, 0.1);

/* カード */
background: white;
border-radius: 12px;
padding: 24px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
```

### レスポンシブブレークポイント
```css
/* モバイル */
@media (max-width: 640px) { }
/* タブレット */
@media (max-width: 768px) { }
/* ラップトップ */
@media (max-width: 1024px) { }
/* デスクトップ */
@media (min-width: 1280px) { }
```

---

## 実装優先順位

1. **Phase 1** (最優先): 会員登録 + オンボーディングウィザード（スクリーンショットのUI完全再現）
2. **Phase 3**: 公開プロフィールページ + サービス詳細ページ
3. **Phase 2**: ダッシュボード基本機能（サービス管理、予約管理）
4. **Phase 5**: 決済基盤（Stripe Connect）
5. **Phase 2続き**: 顧客管理、メッセージ、分析
6. **Phase 4**: 設定画面
7. **Phase 2拡張**: ページビルダー、ワークフロー、会員サイト

---

## 補足要件

- **多言語対応**: 日本語がメイン（UIテキストはすべて日本語）
- **モバイルファースト**: スマートフォンでの利用を最優先に設計
- **アクセシビリティ**: WAI-ARIA準拠、キーボードナビゲーション対応
- **SEO**: メタタグ、OGP、構造化データ対応
- **パフォーマンス**: Core Web Vitals最適化（LCP < 2.5s, FID < 100ms, CLS < 0.1）
- **セキュリティ**: CSRF対策、XSS防止、入力バリデーション、レート制限

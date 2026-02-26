# BreadGeek デザインガイドライン

## カラーパレット

| 変数名 | 値 | 用途 |
|--------|------|------|
| `--color-primary` | `#1A1A1A` | ボタン、メインテキスト、強調 |
| `--color-primary-hover` | `#333333` | ボタンホバー |
| `--color-accent` | `#FF6B6B` | ハイライト、バッジ、アクティブ状態 |
| `--color-accent-light` | `#FF8E9E` | アクセント変化形 |
| `--color-bg-primary` | `#FFFFFF` | カード背景、パネル |
| `--color-bg-secondary` | `#F5F5F5` | ページ背景 |
| `--color-bg-tertiary` | `#F8F8F8` | 微妙な背景 |
| `--color-text-primary` | `#1A1A1A` | メインテキスト |
| `--color-text-secondary` | `#666666` | 補助テキスト、ラベル |
| `--color-text-tertiary` | `#999999` | 三次テキスト |
| `--color-text-placeholder` | `#BDBDBD` | プレースホルダー |
| `--color-border` | `#E0E0E0` | 標準ボーダー |
| `--color-border-light` | `#E8E8E8` | 軽量ボーダー |
| `--color-success` | `#48BB78` | 成功 |
| `--color-warning` | `#ECC94B` | 警告 |
| `--color-error` | `#E53E3E` | エラー |
| `--color-info` | `#4299E1` | 情報 |

## タイポグラフィ

- **フォント**: `"Noto Sans JP", "Hiragino Sans", sans-serif`
- **ウェイト**: 400 (regular), 500 (medium), 700 (bold)
- **ページタイトル**: `text-2xl font-bold text-text-primary`
- **セクションタイトル**: `text-lg font-bold text-text-primary`
- **本文**: `text-sm text-text-secondary`
- **補助テキスト**: `text-xs text-text-tertiary`
- **プレースホルダー**: `text-xs text-text-placeholder`

## レイアウト

- **サイドバー**: 幅200px固定 (`w-[200px] min-w-[200px]`)
- **ヘッダー**: 高さ56px (`h-14`)
- **ページパディング**: `p-8`
- **カード間隔**: `gap-5` または `gap-6`
- **グリッド**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`

## コンポーネントパターン

### カード
```
bg-white rounded-xl border border-border-light p-6
```

### プライマリボタン
```
bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors
```

### セカンダリボタン
```
border border-border rounded-lg px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-secondary transition-colors
```

### テキスト入力
```
w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10
```

### セレクト
```
border border-border rounded-lg px-3 py-2.5 text-sm text-text-secondary focus:border-primary focus:outline-none
```

### テーブルヘッダーセル
```
text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider
```

### 空状態
```
アイコン: size 40-48, text-border, mb-3-4
タイトル: text-sm text-text-tertiary
サブ: text-xs text-text-placeholder mt-1
```

### Betaバッジ
```
text-[10px] bg-accent text-white px-1.5 py-0.5 rounded font-medium
```

## アイコン

- **ライブラリ**: Lucide React
- **ナビゲーション**: size 18
- **ボタン内**: size 14-16
- **空状態**: size 40-48
- **ヘッダーアクション**: size 20

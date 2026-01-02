# スマホでヘッダーが見えない問題

## 問題の説明
スマホのブラウザでサイトを表示すると、ヘッダーが表示されない（見えない）問題が発生しています。

## 関連ファイル

### 1. メインのビューファイル
**`app/views/home/index.html.erb`**
- ヘッダーのHTML構造
- モバイルメニューの実装
- 都市ナビゲーション
- 地図コンテナ

### 2. レイアウトファイル
**`app/views/layouts/application.html.erb`**
- bodyタグのクラス設定（`flex flex-col h-screen`）

### 3. スタイルシート
**`app/assets/stylesheets/application.css`**
- Tailwind CSSの設定
- MapLibre用のカスタムスタイル

### 4. JavaScript
**`app/javascript/application.js`**
- モバイルメニューの開閉処理
- 地図の初期化処理

## 現在の実装状況

### ヘッダー
```html
<header class="bg-blue-600 text-white px-4 py-3 flex justify-between items-center z-50">
```
- `z-50` でz-indexを設定
- `position` が明示的に設定されていない（デフォルトは `static`）

### 地図コンテナ
```html
<div class="flex-1 relative overflow-hidden">
  <div id="map" class="absolute inset-0"></div>
</div>
```
- 地図が `absolute inset-0` で配置されている

### レイアウト構造
```html
<body class="flex flex-col h-screen">
```
- bodyがflexboxで縦方向に配置

## 考えられる原因

1. **z-indexの問題**: ヘッダーの `z-50` が効いていない可能性
2. **positionの問題**: ヘッダーに `position: relative` または `position: sticky` が必要な可能性
3. **地図のオーバーレイ**: 地図がヘッダーの上に表示されている可能性
4. **viewportの問題**: スマホのviewport設定に問題がある可能性

## 確認すべきポイント

1. ヘッダーに `position: relative` または `position: sticky` を追加
2. ヘッダーの `z-index` を確認（地図のz-indexより高いか）
3. スマホのブラウザで開発者ツールで要素を確認
4. 地図の初期化タイミングでヘッダーが隠れていないか確認


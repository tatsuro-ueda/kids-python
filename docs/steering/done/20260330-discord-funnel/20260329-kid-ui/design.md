# こどもむけUI - 設計書

## カラーパレット

| 用途 | 色 |
|------|-----|
| はいけい | `#e8f4fc`（うすいみずいろ） |
| ドットもよう | `#d0e8f5`（すこしこいみずいろ） |
| エディタはいけい | `#f0f8ff`（アリスブルー） |
| 出力エリアはいけい | `#f0f8ff` |
| ヘッダーもじ | `#4a90c4`（みずいろ系） |
| ボタン（じっこう） | `#7ec8e3`（パステルみずいろ） |
| ボタン（けす） | `#f5c6d0`（パステルピンク） |
| エラーぎょうハイライト | `#fde8e8`（うすいピンク） |
| わく線 | `#b8d8e8`（うすいみずいろ） |

## はいけい

CSSの `radial-gradient` でドット（みずたま）もようをつくる。画像ファイルは不要。

```css
body {
  background-color: #e8f4fc;
  background-image: radial-gradient(#d0e8f5 10%, transparent 10%);
  background-size: 30px 30px;
}
```

## ボタン

- `border-radius: 20px`（まるっこく）
- パステルカラー、ホバーですこしこく
- `box-shadow` なし（フラットでやわらかく）

```css
#run-btn {
  background: #7ec8e3;
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 10px 28px;
}

#clear-btn {
  background: #f5c6d0;
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 10px 28px;
}
```

## ヘッダー

たてならび: ヘビのイラスト → タイトルのじゅんばん。中央ぞろえ。

```html
<header>
  <img src="assets/snake.png" alt="ヘビ" class="mascot">
  <h1>Pythonかいはつかんきょう</h1>
</header>
```

```css
header {
  text-align: center;
  margin-bottom: 20px;
}

.mascot {
  width: 80px;
  height: auto;
}

header h1 {
  color: #4a90c4;
}
```

## キャラクター素材

- いらすとやからヘビのイラストをダウンロード
- `assets/snake.png` として配置
- サイズ: 幅80px程度で表示

## エディタ・出力エリア

```css
#editor {
  border: 2px solid #b8d8e8;
  border-radius: 12px;
  background: #f0f8ff;
}

#output {
  background: #f0f8ff;
  border: 2px solid #b8d8e8;
  border-radius: 12px;
}
```

## エラーブロック

現状のスタイルを維持しつつ、わく線の色だけパレットに合わせる。

```css
.error-block {
  border-top: 1px solid #b8d8e8;
  border-bottom: 1px solid #b8d8e8;
}

.cm-error-line {
  background: #fde8e8;
}
```

## へんこうたいしょうファイル

| ファイル | へんこうないよう |
|---------|----------------|
| `style.css` | カラー・はいけい・ボタン・わく線の全面変更 |
| `index.html` | ヘッダーにキャラクター画像を追加 |
| `assets/snake.png` | いらすとやからダウンロードして配置 |

JSの変更はなし。再ビルド不要。

# P2解決策: コード共有機能 — Design

## 方式

コードをBase64エンコードしてURLフラグメント（`#code=...`）に格納する。サーバー不要。

---

## D1. きょうゆうボタン

### UI

```
[じっこう]  [きょうゆう]
```

- 色: ピンク系（`#f5c6d0`）、既存の「けす」ボタンと同じスタイル
- ボタンID: `share-btn`

### エンコード処理

1. 現在のエディタのコードを取得
2. UTF-8 → Base64エンコード（`btoa(encodeURIComponent(code))`でマルチバイト対応）
3. 現在のURLに`#code=<Base64文字列>`を設定
4. URLをクリップボードにコピー（`navigator.clipboard.writeText()`）
5. 出力エリアに「URLをコピーしたよ！おともだちにおしえてあげよう」と表示

### クリップボードAPIが使えない場合

出力エリアにURLを表示してコピーを促す。

---

## D2. 共有URLの読み込み

### 検出タイミング

ページロード時に`window.location.hash`を確認し、`#code=`で始まるフラグメントがあれば共有コードとして処理する。

### 確認ダイアログ

`confirm()`で確認する:

```
おともだちのコードをひらく？
```

- OK → 共有コードをエディタに表示
- キャンセル → localStorageの保存コードを使う（通常動作）

### デコード処理

```js
decodeURIComponent(atob(hash))
```

### 共有コード表示後の動作

- エディタに共有コードを設定
- ユーザーがコードを編集したらlocalStorageに保存（既存の自動保存が動く）
- URLフラグメントはそのまま残す（再度リロードすれば再び確認ダイアログが出る）

---

## D3. 初期化フロー

共有URL検出はエディタ初期化より前に行う必要がある。`editor.js`の`createEditor()`は内部で`loadCode()`を呼んで初期コードを設定するため、共有コードがある場合は`loadCode()`自体が共有コードを返すようにする。

```
ページロード
  ↓
storage.js: getSharedCode() で #code= を検出
  ↓
検出あり → confirm() で確認
  ↓ OK                    ↓ キャンセル
共有コードを内部変数に保持   何もしない
  ↓                        ↓
editor.js: createEditor() → loadCode() を呼ぶ
  ↓
loadCode(): 共有コードがあればそれを返す、なければlocalStorage
  ↓
エディタに表示
```

この方式により`editor.js`の変更は不要で、`storage.js`の`loadCode()`の拡張と`main.js`での検出呼び出しだけで実現できる。

---

## D4. 対象ファイル

| ファイル | 変更内容 |
|---|---|
| `app/index.html` | きょうゆうボタンを追加 |
| `src/main.js` | きょうゆうボタンのイベントハンドラ、共有URL検出ロジック |
| `src/storage.js` | 共有コードのエンコード・デコード関数を追加 |
| `app/style.css` | `#share-btn`のスタイル（既存の`#clear-btn`と同系統） |

export const samples = [
  {
    title: "はじめまして",
    code: `# Scratch: 「こんにちは！という」ブロックとおなじだよ
print("こんにちは！")
`,
  },
  {
    title: "なまえをきいてみよう",
    code: `# Scratch: 「○○とこたえて待つ」ブロックとおなじだよ
なまえ = input("なまえをおしえて: ")
print(なまえ + "さん、こんにちは！")
`,
  },
  {
    title: "くりかえそう",
    code: `# Scratch: 「○かいくりかえす」ブロックとおなじだよ
for かいすう in range(5):
    print(str(かいすう + 1) + "かいめ: こんにちは！")
`,
  },
  {
    title: "もしも...なら",
    code: `# Scratch: 「もし○なら」ブロックとおなじだよ
てんき = input("きょうのてんきは？(はれ/あめ): ")
if てんき == "はれ":
    print("おそとであそぼう！")
else:
    print("おうちでプログラミングしよう！")
`,
  },
  {
    title: "おみくじ",
    code: `# Scratch: 「○から○までのらんすう」ブロックとおなじだよ
import random
けっか = random.choice(["だいきち", "ちゅうきち", "しょうきち", "きち", "すえきち"])
print("きょうのうんせいは..." + けっか + "！")
`,
  },
];

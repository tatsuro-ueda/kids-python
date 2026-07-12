# AGENTS.md

## tn-close 後の退避（送信箱方式・2026-07-13）

- `P0`: この repo で tasknote を `tn-close` したら、`done/` サブフォルダへは移さず、shared helper で送信箱へ出す：
  ```bash
  cd ~/online-python
  uv run --no-project --with pyyaml python3 \
    ~/.local/share/chezmoi/shared/llm-wiki-core/python/llm_wiki_tasknote_ship_helper.py \
    "todos/<閉じたノート>.md"
  ```
- `P0`: `status: done` → `todos/files-to-fetch/`（git管理外の送信箱）へ移動し、元ファイルは残さない。知識の正本は business-docs の llm-wiki に一本化する（SSoT）。
- `P0`: `status: wont` → `todos/wont/` へローカル退避する（知識価値が無いので送らない）。
- `P0`: 送信箱の中身を手で消さない。business-docs 側の fetch が回収し、bd での commit 確認後に自動で消える。
- 理由: bdのllm-wikiを全マシンの頭脳として鍛えるため、完了ノートの知見はすべてbdへ集約する。

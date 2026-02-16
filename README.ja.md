[English](README.md) | [日本語](README.ja.md)

# Layered Flow Chart

人間が大量のソースコードを速く理解するための[Claude Code](https://claude.com/claude-code)プラグイン。

抽象的な処理フローをLayer 0として表示し、そこから気になるモジュールをクリックすることで徐々に具体的なLayerへDeep Diveできる、インタラクティブな単一HTMLをClaudeが生成してくれます。Mermaidなどの旧来のUMLツールのように1階層しか表現できないツールと異なり、読み手が好きに抽象度を往来できるのがメリットです。単一のHTML/JSのためそのままGit管理も可能。AIが生成した大量のコードの理解に疲弊することはもうありません。

![Demo](./assets/demo.gif)

## ライブデモ

**[インタラクティブデモを見る](https://texmeijin.github.io/layered-flow-chart/)** — URL短縮サービスのアーキテクチャを階層的に可視化した例です。

## 特徴

- FigJam/Miro風のインタラクティブなフローチャートを単一HTMLファイルで生成
- ノードをクリックして詳細レイヤーへDeep Dive（スタッキングモーダル）
- Vimスタイルのキーボードナビゲーション: `h` `j` `k` `l` で移動、`o` で開く、`y` でコピー、`q` で閉じる
- ネットワーク境界矢印（インディゴ）でプロセス間接続を区別
- `y` キーまたはコピーボタンでノード内容をMarkdownとしてコピー
- 3つのモードによるワークフロー: **Create** / **Update** / **Refine**
- マルチフェーズSubAgentパイプラインによる徹底的なコード調査後にチャートを生成

## インストール

### マーケットプレイスから（推奨）

```bash
claude plugin marketplace add TeXmeijin/layered-flow-chart
claude plugin install layered-flow-chart
```

### 手動インストール

`skills/layered-flow-chart/` ディレクトリを `~/.claude/skills/` にコピーしてください。

## 使い方

Claude Codeにフローダイアグラムの作成を依頼するだけです:

```
> Make a flow diagram of the authentication module
> Create a layered flow chart of the order processing pipeline
> この機能の処理フロー図を作って
```

スキルが自動的に以下を実行します:
1. シリアルExplore SubAgentを使ってコードベースを調査（広範な調査 → 詳細な調査）
2. 調査結果を構造化されたLEVELSデータオブジェクトに変換
3. インタラクティブなチャートを含む単一HTMLファイルを生成
4. ブラウザで開いて確認

### 既存のチャートを更新する

```
> Update the flow chart to reflect the latest code changes
> フロー図を最新のコードに合わせて更新して
```

### 既存のチャートを改善する

```
> Add boundary connections to the flow chart
> Improve the layout and add more detail to the API layer
> フロー図のレイアウトを改善して
```

## サンプル

`examples/` ディレクトリには、以下を含むNext.js URL短縮サービスのサンプルアプリがあります:
- フロントエンドページ（ホーム + アナリティクスダッシュボード）
- APIルート（リンク作成、アナリティクス付きリダイレクト、統計取得）
- 集計関数を備えたインメモリストア
- 40以上のブラウザ/OS検出ルールを持つUser-Agentパーサー

[ライブデモ](https://texmeijin.github.io/layered-flow-chart/)は、このサンプルアプリから生成されたフローチャートです。

## ライセンス

MIT

# 環境変数の設定方法

## ローカル開発環境

### 方法1: コンソールで環境変数を設定（推奨）

#### Linux/Mac (Bash/Zsh)
```bash
export RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
export MAILER_FROM=noreply@yourdomain.com
export MAILER_DOMAIN=localhost

# サーバーを起動
rails server
```

#### Windows (PowerShell)
```powershell
$env:RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxx"
$env:MAILER_FROM="noreply@yourdomain.com"
$env:MAILER_DOMAIN="localhost"

# サーバーを起動
rails server
```

#### コマンド実行時に直接設定（一時的）
```bash
# Linux/Mac
RESEND_API_KEY=re_xxxxx MAILER_FROM=noreply@example.com rails server

# Windows PowerShell
$env:RESEND_API_KEY="re_xxxxx"; $env:MAILER_FROM="noreply@example.com"; rails server
```

### 方法2: development.local.rb ファイルを使用

1. `config/environments/development.local.rb.example` をコピーして `development.local.rb` を作成：
```bash
cp config/environments/development.local.rb.example config/environments/development.local.rb
```

2. `config/environments/development.local.rb` を編集して実際の値を設定：
```ruby
Rails.application.configure do
  config.resend_api_key = "re_xxxxxxxxxxxxxxxxxxxxx"
  config.mailer_from = "noreply@yourdomain.com"
  config.mailer_domain = "localhost"
end
```

**注意**: `development.local.rb` は `.gitignore` に含まれているため、Gitにコミットされません。

### Resend APIキーの取得方法

1. [Resend](https://resend.com)にアカウントを作成
2. [API Keys](https://resend.com/api-keys)ページにアクセス
3. 新しいAPIキーを作成
4. 作成したAPIキーを環境変数または`development.local.rb`に設定

### メール送信者アドレスの設定

- `MAILER_FROM`には、Resendで認証済みのドメインのメールアドレスを設定してください
- 例: `noreply@yourdomain.com`（`yourdomain.com`はResendで認証済みのドメイン）

### 設定が反映されない場合

- 環境変数を設定した後、サーバーを再起動してください
- `development.local.rb`を編集した場合も、サーバーを再起動してください

---

## 本番環境（Fly.io）

Fly.ioでデプロイしている場合、以下のコマンドで環境変数を設定してください：

```bash
# Resend APIキーを設定
fly secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# メール送信者アドレスを設定
fly secrets set MAILER_FROM=noreply@yourdomain.com

# メールドメインを設定（オプション）
fly secrets set MAILER_DOMAIN=yourdomain.com

# アプリケーションホストを設定（既に設定済みの場合は不要）
fly secrets set APP_HOST=https://yourdomain.com
```

設定を確認するには：

```bash
fly secrets list
```

---

## 注意事項

- **機密情報（APIキーなど）は絶対にGitにコミットしないでください**
- `development.local.rb`は`.gitignore`に含まれているため、Gitにコミットされません
- 環境変数は現在のターミナルセッションでのみ有効です。永続的に設定するには、シェルの設定ファイル（`.bashrc`、`.zshrc`など）に追加してください
- 本番環境では必ず`fly secrets`コマンドで環境変数を設定してください

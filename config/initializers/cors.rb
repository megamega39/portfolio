# Be sure to restart your server when you modify this file.

# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin AJAX requests.

# Read more: https://github.com/cyu/rack-cors

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # 本番環境では環境変数から許可するオリジンを取得
    # 開発環境・テスト環境では全ドメインを許可（開発の利便性のため）
    if Rails.env.production?
      # 環境変数 ALLOWED_ORIGINS にカンマ区切りで許可するオリジンを設定
      # 例: ALLOWED_ORIGINS=https://maguro-map.com,https://www.maguro-map.com
      allowed_origins = ENV.fetch("ALLOWED_ORIGINS", "https://maguro-map.com").split(",").map(&:strip)
      origins allowed_origins
    else
      # 開発環境・テスト環境では全ドメインを許可
      origins "*"
    end

    resource "/api/*",
      headers: :any,
      methods: [ :get, :post, :put, :patch, :delete, :options, :head ]
  end
end

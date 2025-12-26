class HealthController < ApplicationController
  # CSRF保護をスキップ（ヘルスチェック用）
  skip_before_action :verify_authenticity_token
  
  # データベース接続をチェックしないシンプルなヘルスチェック
  def show
    render plain: "OK", status: :ok
  end
end


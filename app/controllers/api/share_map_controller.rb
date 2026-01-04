class Api::ShareMapController < ApplicationController
  skip_before_action :verify_authenticity_token

  # 共有マップ用トークンの発行/再発行
  def create
    unless user_signed_in?
      render json: {
        status: "error",
        error: "ログインが必要です"
      }, status: :unauthorized
      return
    end

    begin
      # トークンを生成（再発行の場合は既存のトークンを無効化）
      token = current_user.generate_share_map_token!
      
      # 共有URLを生成
      share_url = "#{request.base_url}/?shared=#{token}"
      
      render json: {
        status: "success",
        data: {
          share_url: share_url,
          token: token
        }
      }, status: :ok
    rescue => e
      Rails.logger.error "Share map token generation error: #{e.class} - #{e.message}\n#{e.backtrace.join("\n")}"
      render json: {
        status: "error",
        error: "共有URLの生成に失敗しました: #{e.message}"
      }, status: :internal_server_error
    end
  end
end


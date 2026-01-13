class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  # CSRF保護を有効化（APIモードでもセッション認証を使用するため）
  protect_from_forgery with: :exception

  # 現在のユーザー情報を取得するヘルパーメソッド
  helper_method :current_user

  # 本番環境のみ：fly.devドメインからmaguro-map.comへの301リダイレクト
  before_action :redirect_fly_dev_to_custom_domain, if: -> { Rails.env.production? }

  # JSONリクエスト時の認証失敗をハンドリング
  before_action :configure_permitted_parameters, if: :devise_controller?

  # APIリクエストの場合はJSON形式でエラーを返す
  rescue_from ActionController::InvalidAuthenticityToken, with: :handle_csrf_error

  protected

  def redirect_fly_dev_to_custom_domain
    # ヘルスチェックエンドポイントはリダイレクトしない
    return if request.path == "/up"
    
    # fly.devドメインの場合のみリダイレクト
    return unless request.host == "maguro-map.fly.dev"

    # パスとクエリパラメータを保持してリダイレクト
    # allow_other_host: true が必要（外部ホストへのリダイレクトのため）
    redirect_url = "https://maguro-map.com#{request.fullpath}"
    redirect_to redirect_url, status: :moved_permanently, allow_other_host: true
  end

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [ :user_name ])
  end

  def handle_csrf_error
    if request.format.json?
      render json: {
        status: "error",
        error: "CSRF token verification failed"
      }, status: :unprocessable_entity
    else
      raise
    end
  end
end

class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern
  
  # CSRF保護を有効化（APIモードでもセッション認証を使用するため）
  protect_from_forgery with: :exception
  
  # 現在のユーザー情報を取得するヘルパーメソッド
  helper_method :current_user
  
  # JSONリクエスト時の認証失敗をハンドリング
  before_action :configure_permitted_parameters, if: :devise_controller?
  
  # APIリクエストの場合はJSON形式でエラーを返す
  rescue_from ActionController::InvalidAuthenticityToken, with: :handle_csrf_error
  
  protected
  
  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:user_name])
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

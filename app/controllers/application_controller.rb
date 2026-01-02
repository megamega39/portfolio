class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern
  
  # CSRF保護を有効化（APIモードでもセッション認証を使用するため）
  protect_from_forgery with: :exception
  
  # 現在のユーザー情報を取得するヘルパーメソッド
  helper_method :current_user
end

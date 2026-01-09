class Users::PasswordsController < Devise::PasswordsController
  respond_to :json, :html
  skip_before_action :verify_authenticity_token, if: -> { request.format.json? }

  def new
    respond_to do |format|
      format.html { super }
      format.json { redirect_to root_path, status: :see_other }
    end
  end

  def edit
    respond_to do |format|
      format.html { super }
      format.json { redirect_to root_path, status: :see_other }
    end
  end

  def create
    self.resource = resource_class.send_reset_password_instructions(resource_params)
    yield resource if block_given?

    if successfully_sent?(resource)
      respond_to do |format|
        format.html { redirect_to root_path, notice: "パスワード再設定方法をメールで送信しました。" }
        format.json { render json: { status: "success", message: "パスワード再設定方法をメールで送信しました。" } }
      end
    else
      respond_to do |format|
        format.html { redirect_to root_path, alert: "メールアドレスが見つかりませんでした。" }
        format.json { render json: { status: "error", errors: resource.errors.full_messages }, status: :unprocessable_entity }
      end
    end
  end

  def update
    # トークンからユーザーを取得（まだパスワードは更新していない）
    token = resource_params[:reset_password_token]
    user = resource_class.with_reset_password_token(token) if token.present?
    
    # 現在のパスワードと同じかチェック
    if user.present? && user.persisted? && resource_params[:password].present?
      if user.valid_password?(resource_params[:password])
        # 現在のパスワードと同じ場合はエラーを追加（属性名なしでbaseに追加）
        error_message = I18n.t('activerecord.errors.models.user.attributes.password.same_as_current')
        user.errors.add(:base, error_message)
        self.resource = user
        set_minimum_password_length
        
        respond_to do |format|
          format.html { render :edit }
          format.json do
            render json: { status: "error", errors: resource.errors.full_messages }, status: :unprocessable_entity
          end
        end
        return
      end
    end

    # 通常のDeviseの処理を実行
    self.resource = resource_class.reset_password_by_token(resource_params)
    yield resource if block_given?

    if resource.errors.empty?
      resource.unlock_access! if unlockable?(resource)
      if Devise.sign_in_after_reset_password
        flash_message = resource.active_for_authentication? ? :updated : :updated_not_active
        set_flash_message!(:notice, flash_message)
        sign_in(resource_name, resource)
      else
        set_flash_message!(:notice, :updated_not_active)
      end
      
      respond_to do |format|
        format.html { redirect_to root_path(login: 'success'), notice: "パスワードを変更しました。" }
        format.json { render json: { status: "success", message: "パスワードを変更しました。" } }
      end
    else
      set_minimum_password_length
      respond_to do |format|
        format.html { render :edit }
        format.json do
          # エラーメッセージを日本語化
          error_messages = resource.errors.full_messages.map do |msg|
            # reset_password_tokenのエラーを分かりやすく
            if msg.include?("reset_password_token") || msg.include?("無効") || msg.include?("期限切れ")
              "パスワード再設定リンクが無効または期限切れです。新しいリンクをリクエストしてください。"
            else
              msg
            end
          end
          render json: { status: "error", errors: error_messages }, status: :unprocessable_entity
        end
      end
    end
  end
end

class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json, :html
  skip_before_action :verify_authenticity_token, if: -> { request.format.json? }

  def create
    build_resource(sign_up_params)

    resource.save
    yield resource if block_given?
    if resource.persisted?
      if resource.active_for_authentication?
        set_flash_message! :notice, :signed_up
        sign_up(resource_name, resource)
        respond_to do |format|
          format.html { redirect_to root_path }
          format.json { render json: { status: 'success', message: 'アカウント登録に成功しました', user: { id: resource.id, email: resource.email, user_name: resource.user_name } } }
        end
      else
        set_flash_message! :notice, :"signed_up_but_#{resource.inactive_message}"
        expire_data_after_sign_in!
        respond_to do |format|
          format.html { redirect_to root_path }
          format.json { render json: { status: 'success', message: 'アカウント登録に成功しました。確認メールを送信しました。' } }
        end
      end
    else
      clean_up_passwords resource
      set_minimum_password_length
      respond_to do |format|
        format.html { render :new }
        format.json { render json: { status: 'error', errors: resource.errors.full_messages }, status: :unprocessable_entity }
      end
    end
  end

  protected

  def sign_up_params
    params.require(:user).permit(:email, :user_name, :password, :password_confirmation)
  end
end


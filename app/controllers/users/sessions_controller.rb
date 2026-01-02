class Users::SessionsController < Devise::SessionsController
  respond_to :json, :html
  skip_before_action :verify_authenticity_token, if: -> { request.format.json? }

  def create
    self.resource = warden.authenticate!(auth_options)
    set_flash_message!(:notice, :signed_in)
    sign_in(resource_name, resource)
    yield resource if block_given?
    
    respond_to do |format|
      format.html { redirect_to root_path }
      format.json { render json: { status: 'success', message: 'ログインに成功しました', user: { id: resource.id, email: resource.email, user_name: resource.user_name } } }
    end
  rescue => e
    respond_to do |format|
      format.html { redirect_to root_path, alert: 'ログインに失敗しました' }
      format.json { render json: { status: 'error', errors: ['メールアドレスまたはパスワードが正しくありません'] }, status: :unauthorized }
    end
  end

  def destroy
    signed_out = (Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name))
    set_flash_message! :notice, :signed_out if signed_out
    yield if block_given?
    
    respond_to do |format|
      format.html { redirect_to root_path }
      format.json { render json: { status: 'success', message: 'ログアウトしました' } }
    end
  end

  protected

  def auth_options
    { scope: resource_name, recall: "#{controller_path}#new" }
  end
end


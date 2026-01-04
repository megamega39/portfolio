class Api::PinsController < ApplicationController
  # CORS対応
  skip_before_action :verify_authenticity_token

  # エラーハンドリング
  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found
  rescue_from ActionController::ParameterMissing, with: :parameter_missing
  rescue_from StandardError, with: :handle_standard_error

  # ピンの一覧取得
  def index
    begin
      # sharedパラメータがある場合：共有マップモード
      if params[:shared].present?
        # トークン検証（全ユーザーをチェック）
        shared_user = User.where.not(share_map_token_digest: nil).find { |u| u.share_map_token_valid?(params[:shared]) }
        
        unless shared_user
          render json: {
            status: "error",
            error: "無効な共有トークンです"
          }, status: :unauthorized
          return
        end
        
        # 自分の共有トークンの場合は通常モードとして扱う
        if user_signed_in? && shared_user.id == current_user.id
          # 通常モード：publicピン + 自分のprivateピン
          pins = Pin.where("visibility = ? OR visibility IS NULL", 0)
          private_pins = Pin.where(visibility: 1, user_id: current_user.id)
          pins = pins.or(private_pins)
          pins = pins.order(created_at: :desc).limit(1000)
        else
          # 他人の共有トークンの場合：共有ユーザーのピン（public + private両方）を取得
          pins = Pin.where(user_id: shared_user.id).order(created_at: :desc).limit(1000)
        end
      else
        # デフォルト: publicピン + (ログイン中なら自分のprivateピンも含む)
        # 管理者の場合はすべてのピン（public/private/匿名）を取得
        if user_signed_in? && current_user.admin?
          pins = Pin.all.order(created_at: :desc).limit(1000)
        else
          # 既存のピン（visibilityがnull）もpublicとして扱う
          # enumの値は整数値（0 = public, 1 = private）
          pins = Pin.where("visibility = ? OR visibility IS NULL", 0)
          
          # ログイン中なら自分のprivateピンも追加
          if user_signed_in?
            private_pins = Pin.where(visibility: 1, user_id: current_user.id)
            pins = pins.or(private_pins)
          end
          
          pins = pins.order(created_at: :desc).limit(1000) # 最新1000件まで
        end
      end
      
      render json: {
        status: "success",
        data: pins.map { |pin| pin_json(pin) }
      }
    rescue => e
      # 予期しないエラーをキャッチしてJSON形式で返す
      Rails.logger.error "Pin index error: #{e.class} - #{e.message}\n#{e.backtrace.join("\n")}"
      render json: {
        status: "error",
        error: "ピンの取得に失敗しました: #{e.message}"
      }, status: :internal_server_error
    end
  end

  # ピンの作成
  def create
    # delete_tokenを生成
    delete_token = SecureRandom.urlsafe_base64(32)
    delete_token_digest = BCrypt::Password.create(delete_token)

    # ピンのパラメータを準備
    pin_attributes = pin_params.merge(delete_token_digest: delete_token_digest)
    
    # visibilityの処理
    # visibilityパラメータが送信されているのにログインしていない場合は401エラー
    if pin_attributes[:visibility].present? && !user_signed_in?
      render json: {
        status: "error",
        error: "セッションが無効になりました。再ログインが必要です。"
      }, status: :unauthorized
      return
    end
    
    if user_signed_in?
      # ログイン中: visibilityを受け取る（デフォルトはpublic）
      visibility_value = pin_attributes[:visibility] || 'public'
      # enumは文字列でも整数値でも受け付けるが、明示的に設定
      pin_attributes[:visibility] = visibility_value
      pin_attributes[:user_id] = current_user.id
    else
      # 未ログイン: 強制的にpublic
      pin_attributes[:visibility] = 'public'
    end
    
    # visibilityがnilの場合は削除（デフォルト値が適用される）
    pin_attributes.delete(:visibility) if pin_attributes[:visibility].nil?

    begin
      pin = Pin.new(pin_attributes)

      if pin.save
        render json: {
          status: "success",
          data: {
            pin: pin_json(pin),
            delete_token: delete_token # 初回のみ返す
          }
        }, status: :created
      else
        # バリデーションエラーをJSON形式で返す
        render json: {
          status: "error",
          error: pin.errors.full_messages.join(", "),
          errors: pin.errors.full_messages
        }, status: :unprocessable_entity
      end
    rescue => e
      # 予期しないエラーをキャッチしてJSON形式で返す
      Rails.logger.error "Pin creation error: #{e.class} - #{e.message}\n#{e.backtrace.join("\n")}"
      render json: {
        status: "error",
        error: "ピンの作成に失敗しました: #{e.message}"
      }, status: :internal_server_error
    end
  end

  # ピンの編集
  def update
    pin = Pin.find_by(id: params[:id])
    
    unless pin
      render json: {
        status: "error",
        error: "Pin not found"
      }, status: :not_found
      return
    end

    # 編集権限のチェック
    unless can_edit_pin?(pin)
      render json: {
        status: "error",
        error: "編集権限がありません"
      }, status: :unauthorized
      return
    end

    # 更新パラメータを準備
    update_params = update_pin_params
    
    # 匿名投稿ピン（user_idがnull）の場合は、管理者でもvisibilityを更新しない（公開のみ）
    # 未ログインの場合はvisibilityを更新しない（publicのまま）
    if pin.user_id.nil? || !user_signed_in?
      update_params = update_params.except(:visibility)
    end

    # 更新可能なパラメータ（lat/lngは編集不可）
    if pin.update(update_params)
      render json: {
        status: "success",
        data: {
          pin: pin_json(pin)
        }
      }, status: :ok
    else
      render json: {
        status: "error",
        errors: pin.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  # ピンの削除
  def destroy
    pin = Pin.find_by(id: params[:id])
    
    unless pin
      render json: {
        status: "error",
        error: "Pin not found"
      }, status: :not_found
      return
    end

    # 削除権限のチェック
    unless can_delete_pin?(pin)
      render json: {
        status: "error",
        error: "削除権限がありません"
      }, status: :unauthorized
      return
    end

    if pin.destroy
      render json: {
        status: "success",
        message: "Pin deleted successfully"
      }, status: :ok
    else
      render json: {
        status: "error",
        errors: pin.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  private

  # ピンの編集権限をチェック
  def can_edit_pin?(pin)
    # shared map閲覧中は編集不可（管理者でも不可）
    return false if in_shared_map_mode?

    # 管理者はすべてのピンを編集可能
    return true if user_signed_in? && current_user.admin?

    # 通常ユーザーの権限チェック
    # 1. ログイン後に登録したピン（user_idが存在する）の場合：自分のピンのみ
    if pin.user_id.present?
      return user_signed_in? && pin.user_id == current_user.id
    end

    # 2. 未ログイン時に登録したピン（user_idがnull）の場合：delete_tokenで認証
    delete_token = params[:delete_token]
    return false unless delete_token && pin.delete_token_digest.present?
    
    BCrypt::Password.new(pin.delete_token_digest) == delete_token
  end

  # ピンの削除権限をチェック
  def can_delete_pin?(pin)
    # shared map閲覧中は削除不可（管理者でも不可）
    return false if in_shared_map_mode?

    # 管理者はすべてのピンを削除可能
    return true if user_signed_in? && current_user.admin?

    # 通常ユーザーの権限チェック
    # 1. ログイン後に登録したピン（user_idが存在する）の場合：自分のピンのみ
    if pin.user_id.present?
      return user_signed_in? && pin.user_id == current_user.id
    end

    # 2. 未ログイン時に登録したピン（user_idがnull）の場合：delete_tokenで認証
    delete_token = params[:delete_token]
    return false unless delete_token && pin.delete_token_digest.present?
    
    BCrypt::Password.new(pin.delete_token_digest) == delete_token
  end

  # shared map閲覧中かどうかをチェック
  def in_shared_map_mode?
    return false unless params[:shared].present?

    # トークン検証
    shared_user = User.where.not(share_map_token_digest: nil).find { |u| u.share_map_token_valid?(params[:shared]) }
    return false unless shared_user

    # 自分の共有トークンの場合は通常モードとして扱う
    return false if user_signed_in? && shared_user.id == current_user.id

    # 他人の共有トークンの場合は共有マップモード
    true
  end

  def pin_params
    # JSON形式でもフォーム形式でも受け取れるようにする
    if params[:pin].present?
      params.require(:pin).permit(:price, :distance_km, :time_slot, :weather, :lat, :lng, :visibility)
    else
      params.permit(:price, :distance_km, :time_slot, :weather, :lat, :lng, :visibility)
    end
  end

  def update_pin_params
    # 編集時はlat/lngは編集不可
    if params[:pin].present?
      params.require(:pin).permit(:price, :distance_km, :time_slot, :weather, :visibility)
    else
      params.permit(:price, :distance_km, :time_slot, :weather, :visibility)
    end
  end

  def pin_json(pin)
    # visibilityがnilの場合はpublicとして扱う（既存ピン対応）
    # enumの値は整数値（0 = public, 1 = private）なので、nilの場合は0（public）として扱う
    visibility_value = if pin.visibility.nil?
      'public'
    else
      # enumの値（整数値）を文字列に変換
      pin.visibility
    end
    
    {
      id: pin.id,
      price: pin.price,
      distance_km: pin.distance_km.to_f,
      time_slot: pin.time_slot,
      weather: pin.weather,
      lat: pin.lat.to_f,
      lng: pin.lng.to_f,
      icon_type: pin.icon_type,
      visibility: visibility_value,
      created_at: pin.created_at.iso8601,
      edited_at: pin.edited_at&.iso8601,
      user_id: pin.user_id # ユーザーIDを追加（削除権限の判定に使用）
    }
  end

  def record_not_found
    render json: {
      status: "error",
      error: "Record not found"
    }, status: :not_found
  end

  def parameter_missing(exception)
    render json: {
      status: "error",
      error: "Parameter missing: #{exception.param}"
    }, status: :bad_request
  end

  def handle_standard_error(exception)
    # すべての予期しないエラーをJSON形式で返す
    Rails.logger.error "API Error: #{exception.class} - #{exception.message}\n#{exception.backtrace.join("\n")}"
    render json: {
      status: "error",
      error: "サーバーエラーが発生しました: #{exception.message}"
    }, status: :internal_server_error
  end
end


class Api::PinsController < ApplicationController
  # CORS対応（必要に応じて）
  skip_before_action :verify_authenticity_token

  # ピンの一覧取得
  def index
    pins = Pin.order(created_at: :desc).limit(1000) # 最新1000件まで
    render json: pins.map { |pin| pin_json(pin) }
  end

  # ピンの作成
  def create
    # delete_tokenを生成
    delete_token = SecureRandom.urlsafe_base64(32)
    delete_token_digest = BCrypt::Password.create(delete_token)

    pin = Pin.new(pin_params.merge(delete_token_digest: delete_token_digest))

    if pin.save
      render json: {
        pin: pin_json(pin),
        delete_token: delete_token # 初回のみ返す
      }, status: :created
    else
      render json: { errors: pin.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # ピンの削除
  def destroy
    pin = Pin.find_by(id: params[:id])
    
    unless pin
      render json: { error: "Pin not found" }, status: :not_found
      return
    end

    # delete_tokenで認証
    delete_token = params[:delete_token]
    unless delete_token && BCrypt::Password.new(pin.delete_token_digest) == delete_token
      render json: { error: "Invalid delete token" }, status: :unauthorized
      return
    end

    if pin.destroy
      render json: { message: "Pin deleted successfully" }, status: :ok
    else
      render json: { errors: pin.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def pin_params
    params.require(:pin).permit(:price, :distance_km, :time_slot, :weather, :lat, :lng)
  end

  def pin_json(pin)
    {
      id: pin.id,
      price: pin.price,
      distance_km: pin.distance_km.to_f,
      time_slot: pin.time_slot,
      weather: pin.weather,
      lat: pin.lat.to_f,
      lng: pin.lng.to_f,
      icon_type: pin.icon_type,
      created_at: pin.created_at.iso8601
    }
  end
end


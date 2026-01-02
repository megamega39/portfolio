class Api::MyAreaController < ApplicationController
  # CORS対応
  skip_before_action :verify_authenticity_token
  
  before_action :set_json_format
  before_action :check_authentication, only: [:show, :update]

  # マイエリア情報を取得
  def show
    if current_user.my_area_lat.present? && current_user.my_area_lng.present?
      render json: {
        status: "success",
        data: {
          lat: current_user.my_area_lat.to_f,
          lng: current_user.my_area_lng.to_f,
          zoom: current_user.my_area_zoom.to_f
        }
      }
    else
      render json: {
        status: "success",
        data: nil
      }
    end
  end

  # マイエリア情報を更新
  def update
    begin
      unless user_signed_in?
        Rails.logger.error "認証されていません"
        render json: {
          status: "error",
          error: "ログインが必要です"
        }, status: :unauthorized
        return
      end
      
      params_hash = my_area_params
      # パラメータ名をカラム名にマッピング
      update_params = {
        my_area_lat: params_hash[:lat],
        my_area_lng: params_hash[:lng],
        my_area_zoom: params_hash[:zoom]
      }
      Rails.logger.info "マイエリア更新パラメータ: #{update_params.inspect}, ユーザーID: #{current_user.id}"
      
      if current_user.update(update_params)
        render json: {
          status: "success",
          data: {
            lat: current_user.my_area_lat.to_f,
            lng: current_user.my_area_lng.to_f,
            zoom: current_user.my_area_zoom.to_f
          }
        }
      else
        Rails.logger.error "マイエリア更新エラー: #{current_user.errors.full_messages.inspect}"
        render json: {
          status: "error",
          errors: current_user.errors.full_messages
        }, status: :unprocessable_entity
      end
    rescue ActionController::ParameterMissing => e
      Rails.logger.error "パラメータ不足: #{e.message}"
      render json: {
        status: "error",
        error: "パラメータが不足しています: #{e.message}"
      }, status: :bad_request
    rescue => e
      Rails.logger.error "マイエリア更新例外: #{e.class} - #{e.message}\n#{e.backtrace.join("\n")}"
      render json: {
        status: "error",
        error: e.message
      }, status: :internal_server_error
    end
  end

  private

  def set_json_format
    request.format = :json
  end
  
  def check_authentication
    unless user_signed_in?
      render json: {
        status: "error",
        error: "ログインが必要です"
      }, status: :unauthorized
      return false
    end
    true
  end

  def my_area_params
    if params[:my_area].present?
      params.require(:my_area).permit(:lat, :lng, :zoom)
    else
      # フォールバック: 直接パラメータから取得
      params.permit(:lat, :lng, :zoom)
    end
  end
  
end


class Pin < ApplicationRecord
  belongs_to :user, optional: true # MVPではuser_idは使わないのでoptional

  enum visibility: { public: 0, private: 1 }, _prefix: :visibility

  validates :price, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 3000, less_than_or_equal_to: 9999 }
  validates :distance_km, presence: true, numericality: { greater_than_or_equal_to: 0.1, less_than_or_equal_to: 99.9 }
  validates :time_slot, presence: true
  validates :weather, presence: true
  validates :lat, presence: true, numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90 }
  validates :lng, presence: true, numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 }
  validates :delete_token_digest, presence: true
  # visibilityはenumでデフォルト値が0（public）なので、presenceバリデーションは不要

  # プライベートピンにはuser_idが必須
  validate :private_pin_requires_user

  # 編集時にedited_atを更新
  before_update :set_edited_at

  # アイコンの種類を判定
  def icon_type
    if price >= 6000
      "whale" # クジラ
    elsif price >= 3000
      "tuna" # マグロ
    else
      nil
    end
  end

  private

  def private_pin_requires_user
    # enumの値は文字列 'private' または整数値 1 で比較可能
    # visibilityがnilの場合はスキップ（既存ピン対応）
    if visibility.present? && (visibility == 'private' || visibility == 1) && user_id.blank?
      errors.add(:user_id, "プライベートピンにはユーザーIDが必要です")
    end
  end

  def set_edited_at
    self.edited_at = Time.current if changed?
  end
end


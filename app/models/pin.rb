class Pin < ApplicationRecord
  belongs_to :user, optional: true # MVPではuser_idは使わないのでoptional

  validates :price, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :distance_km, presence: true, numericality: { greater_than: 0 }
  validates :time_slot, presence: true
  validates :weather, presence: true
  validates :lat, presence: true, numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90 }
  validates :lng, presence: true, numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 }
  validates :delete_token_digest, presence: true

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
end


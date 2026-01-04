class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :pins, dependent: :destroy

  # ロール定義（enum: user=0, admin=1）
  enum role: { user: 0, admin: 1 }

  # Deviseのemail認証を使用するため、user_nameはオプション扱い
  validates :user_name, presence: true, if: -> { new_record? || user_name_changed? }

  # 共有マップ用トークンを生成
  def generate_share_map_token!
    token = SecureRandom.urlsafe_base64(32)
    self.share_map_token_digest = BCrypt::Password.create(token)
    save!
    token
  end

  # 共有マップ用トークンを検証
  def share_map_token_valid?(token)
    return false if share_map_token_digest.blank?
    BCrypt::Password.new(share_map_token_digest) == token
  rescue BCrypt::Errors::InvalidHash
    false
  end
end


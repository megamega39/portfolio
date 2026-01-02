class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :pins, dependent: :destroy

  # Deviseのemail認証を使用するため、user_nameはオプション扱い
  validates :user_name, presence: true, if: -> { new_record? || user_name_changed? }
end


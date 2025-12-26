class User < ApplicationRecord
  has_many :pins, dependent: :destroy
end


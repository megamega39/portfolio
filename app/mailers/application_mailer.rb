class ApplicationMailer < ActionMailer::Base
  # 開発環境ではconfig/environments/development.rbのmailer_fromを使用
  # 本番環境では環境変数MAILER_FROMを使用
  default from: -> {
    if Rails.env.development?
      Rails.application.config.mailer_from || ENV.fetch("MAILER_FROM", "noreply@example.com")
    else
      ENV.fetch("MAILER_FROM", "noreply@example.com")
    end
  }
  layout "mailer"
end

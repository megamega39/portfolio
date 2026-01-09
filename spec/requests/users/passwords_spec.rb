require 'rails_helper'

RSpec.describe 'Users::Passwords', type: :request do
  let(:user) { User.create!(email: 'test@example.com', password: 'password123', user_name: 'testuser') }
  let(:reset_token) { nil }

  before do
    # パスワード再設定トークンを生成
    user.send_reset_password_instructions
    user.reload
    @reset_token = user.reset_password_token
  end

  describe 'PUT /users/password' do
    context 'when reset_password_token is valid' do
      context 'with different password' do
        it 'updates the password successfully' do
          put '/users/password', params: {
            user: {
              reset_password_token: @reset_token,
              password: 'newpassword123',
              password_confirmation: 'newpassword123'
            }
          }, headers: { 'Accept' => 'application/json' }

          expect(response).to have_http_status(:success)
          json = JSON.parse(response.body)
          expect(json['status']).to eq('success')
          expect(json['message']).to eq('パスワードを変更しました。')

          # 新しいパスワードでログインできることを確認
          user.reload
          expect(user.valid_password?('newpassword123')).to be true
          expect(user.valid_password?('password123')).to be false
        end
      end

      context 'with same password as current' do
        it 'returns error and does not update password' do
          put '/users/password', params: {
            user: {
              reset_password_token: @reset_token,
              password: 'password123',
              password_confirmation: 'password123'
            }
          }, headers: { 'Accept' => 'application/json' }

          expect(response).to have_http_status(:unprocessable_entity)
          json = JSON.parse(response.body)
          expect(json['status']).to eq('error')
          expect(json['errors']).to be_an(Array)
          expect(json['errors'].any? { |msg| msg.include?('現在のパスワードと同じパスワードは設定できません') }).to be true

          # パスワードが変更されていないことを確認
          user.reload
          expect(user.valid_password?('password123')).to be true
        end
      end

      context 'with invalid reset_password_token' do
        it 'returns error' do
          put '/users/password', params: {
            user: {
              reset_password_token: 'invalid_token',
              password: 'newpassword123',
              password_confirmation: 'newpassword123'
            }
          }, headers: { 'Accept' => 'application/json' }

          expect(response).to have_http_status(:unprocessable_entity)
          json = JSON.parse(response.body)
          expect(json['status']).to eq('error')
        end
      end

      context 'with password mismatch' do
        it 'returns error' do
          put '/users/password', params: {
            user: {
              reset_password_token: @reset_token,
              password: 'newpassword123',
              password_confirmation: 'differentpassword'
            }
          }, headers: { 'Accept' => 'application/json' }

          expect(response).to have_http_status(:unprocessable_entity)
          json = JSON.parse(response.body)
          expect(json['status']).to eq('error')
        end
      end
    end
  end
end

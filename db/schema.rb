# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2024_01_01_000004) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "pins", force: :cascade do |t|
    t.bigint "user_id"
    t.integer "price", null: false
    t.decimal "distance_km", precision: 3, scale: 1, null: false
    t.string "time_slot", null: false
    t.string "weather", null: false
    t.decimal "lat", precision: 9, scale: 6, null: false
    t.decimal "lng", precision: 9, scale: 6, null: false
    t.string "delete_token_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_pins_on_created_at"
    t.index ["lat"], name: "index_pins_on_lat"
    t.index ["lng"], name: "index_pins_on_lng"
    t.index ["user_id"], name: "index_pins_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "user_name", null: false
    t.string "encrypted_password", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.decimal "my_area_lat", precision: 9, scale: 6
    t.decimal "my_area_lng", precision: 9, scale: 6
    t.decimal "my_area_zoom", precision: 3, scale: 1, default: "12.0"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "pins", "users"
end

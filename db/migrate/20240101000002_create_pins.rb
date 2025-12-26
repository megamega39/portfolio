class CreatePins < ActiveRecord::Migration[7.2]
  def change
    create_table :pins do |t|
      t.references :user, null: true, foreign_key: true # MVPではnull許可
      t.integer :price, null: false
      t.decimal :distance_km, precision: 3, scale: 1, null: false
      t.string :time_slot, null: false
      t.string :weather, null: false
      t.decimal :lat, precision: 9, scale: 6, null: false
      t.decimal :lng, precision: 9, scale: 6, null: false
      t.string :delete_token_digest, null: false

      t.timestamps
    end

    add_index :pins, :lat
    add_index :pins, :lng
    add_index :pins, :created_at
  end
end


class AddMyAreaToUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :my_area_lat, :decimal, precision: 9, scale: 6
    add_column :users, :my_area_lng, :decimal, precision: 9, scale: 6
    add_column :users, :my_area_zoom, :decimal, precision: 3, scale: 1, default: 12.0
  end
end


class AddVisibilityToPins < ActiveRecord::Migration[7.2]
  def change
    add_column :pins, :visibility, :integer, default: 0, null: false
    add_column :pins, :edited_at, :datetime, null: true
    
    add_index :pins, :visibility
  end
end


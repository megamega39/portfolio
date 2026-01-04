class AddShareMapTokenDigestToUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :share_map_token_digest, :string
    add_index :users, :share_map_token_digest
  end
end


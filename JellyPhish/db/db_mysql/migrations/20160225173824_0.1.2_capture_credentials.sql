
-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
ALTER TABLE `pages` ADD COLUMN capture_credentials BOOLEAN;
ALTER TABLE `pages` ADD COLUMN capture_passwords BOOLEAN;
ALTER TABLE `pages` ADD COLUMN check_user_activity BOOLEAN;


-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back


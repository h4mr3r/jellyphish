
-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
UPDATE results 
SET status = "Submitted Data" 
WHERE id IN (
	SELECT results.id
	FROM results, events
	WHERE results.status = "Success"
      AND events.message="Clicked Link"
      AND events.first_name= results.first_name
      AND events.last_name= results.last_name
      AND results.email = events.email
      AND results.campaign_id = events.campaign_id);
		
UPDATE results 
SET status = "Clicked Link" 
WHERE id IN (
	SELECT results.id
	FROM results, events
	WHERE results.status = "Success"
		AND events.message="Clicked Link"
        AND events.first_name= results.first_name
        AND events.last_name= results.last_name
		AND results.email = events.email
		AND results.campaign_id = events.campaign_id);

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back


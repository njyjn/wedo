-- The Slack bot token was stored in the publicly readable settings table and is now read from
-- the SLACK_BOT_TOKEN environment variable instead. Remove the stored copy.
DELETE FROM "Feature" WHERE "name" = 'slackBotToken';

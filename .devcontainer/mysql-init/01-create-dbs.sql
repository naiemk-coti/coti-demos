-- Create databases for treasury (main + db_sync + gcoti snapshot) when running in devcontainer.
CREATE DATABASE IF NOT EXISTS treasury_dev;
CREATE DATABASE IF NOT EXISTS db_app_dev;
CREATE DATABASE IF NOT EXISTS treasury_gcoti_rewards;

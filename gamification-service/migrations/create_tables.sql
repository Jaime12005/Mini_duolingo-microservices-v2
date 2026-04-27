-- Create tables for gamification-service
CREATE TABLE IF NOT EXISTS points (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  points INT NOT NULL,
  createdAt DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS streaks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL UNIQUE,
  currentStreak INT NOT NULL DEFAULT 0,
  lastActivityDate DATE
);

CREATE TABLE IF NOT EXISTS achievements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  achievementType VARCHAR(100) NOT NULL,
  unlockedAt DATETIME NOT NULL
);

import app from './app';
import config from './config/env';

const port = config.port || 5300;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Gamification service listening on port ${port}`);
});

import app from './app';
import config from './config/env';

const port = config.port || 5200;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Pronunciation service listening on port ${port}`);
});

import app from './app';
import config from './config';

app.listen(config.port, () => {
  console.log(`Multimedia Service listening on port ${config.port}`);
});
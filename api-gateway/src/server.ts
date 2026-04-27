import app from './app';
import config from './config/env';

const port = config.PORT;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API Gateway listening on port ${port}`);
});

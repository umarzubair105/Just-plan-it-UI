import {environment} from '../environment/environment';

export const AppConstants = {
  API_URL: environment.apiUrl,//'http://localhost:8080',
  MAX_RETRIES: environment.maxRetries,
  DEFAULT_TIMEOUT: 5000,
  FEATURE_FLAGS: {
    ENABLE_NEW_DESIGN: true,
    ENABLE_EXPERIMENTAL_FEATURE: false,
  },
  TOKEN_KEY: 'jwt_token',
  DATE_TIME_FORMAT: 'yyyy-MM-dd HH:mm:ss'
};

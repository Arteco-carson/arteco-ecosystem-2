import { Platform } from 'react-native';

const androidDevelopmentUrl = 'http://10.0.2.2:5240/api';
const iosDevelopmentUrl = 'http://localhost:5240/api';

const developmentUrl = Platform.OS === 'android' ? androidDevelopmentUrl : iosDevelopmentUrl;

const productionUrl = 'https://arteco-fineartapi-prod-bxetekage3a2b6em.eastus2-01.azurewebsites.net/api';

// For a production build, we will use the productionUrl.
// For development, we'll use the developmentUrl.
// __DEV__ is a global variable set by React Native. It is true when in development mode.
export const BASE_URL = __DEV__ ? developmentUrl : productionUrl;
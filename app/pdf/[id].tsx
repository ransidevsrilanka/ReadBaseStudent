import { Platform } from 'react-native';

// Dynamically import the correct platform-specific component
const PDFViewer = Platform.select({
  web: require('./[id].web').default,
  default: require('./[id].native').default,
});

export default PDFViewer;

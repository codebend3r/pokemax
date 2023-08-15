import { QueryClient, QueryClientProvider } from 'react-query';
import { MainApp } from './container/MainApp';

import './App.scss';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <MainApp />
    </QueryClientProvider>
  );
};

export default App;

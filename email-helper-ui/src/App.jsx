import Layout from './components/Layout';
import './App.css';

console.log('=== APP.JSX LOADING ===');
console.log('Layout component:', Layout);

function App() {
  console.log('=== APP COMPONENT RENDERING ===');
  
  return (
    <div className="App">
      <Layout />
    </div>
  );
}

export default App;

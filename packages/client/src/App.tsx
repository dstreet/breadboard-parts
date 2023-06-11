import './App.css';
import { PartNumberForm } from './PartNumberForm';
import { PartView } from './PartView';
import { useQuery } from './useQuery';

function App() {
  const part = useQuery("part")

  const handleSubmit = (partNumber: string) => {
    window.location.search = `part=${partNumber}`
  }

  return (
    <div className="App">
      {!part && <PartNumberForm onSubmit={handleSubmit}/>}
      {part && <PartView partNumber={part}/>}
    </div>
  );
}

export default App;

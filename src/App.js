import "./App.css";
import JSONData from "./data.json";
import CommentsContainer from "./Components/CommentsContainer/CommentsContainer";

function App() {
  return (
    <div className="App">
      <CommentsContainer
        comments={JSONData.comments}
        currentUser={JSONData.currentUser}
      />
      <header className="App-header"></header>
    </div>
  );
}

export default App;

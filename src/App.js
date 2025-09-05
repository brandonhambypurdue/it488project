
import './App.css';
import './components/displayDateTime.js';
import TimeButtonGroup from './components/timetrack.js';
import AddButton from './components/additionButton.js'; 
import CalendarHolder from './components/calendarholder.js';
import HabitTracking from './components/habitList.js';
import ProgressGraph from './components/graph.js';
import PopUp from './components/loginPop.js';

function App() {
  return (
  
   <div className='mainPage'>
  
 
    <h1 className='welcome'>Good afternoon, <span>user</span></h1>

  <AddButton></AddButton>
  <CalendarHolder></CalendarHolder>
  <HabitTracking></HabitTracking>
  <ProgressGraph></ProgressGraph>
      
      <PopUp></PopUp>
      

   
    </div>
  );
}

export default App;

import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { auth } from './firebase/config';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import WeekSchedule from './components/WeekSchedule';
import DaySchedule from './components/DaySchedule';
import LessonEdit from './components/LessonEdit';
import ItemsToTake from './components/ItemsToTake';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LoadingScreen from './components/LoadingScreen';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('✅ User ID:', user.uid);
        setUserId(user.uid);
      } else {
        console.log('No user, signing in anonymously...');
        signInAnonymously(auth)
          .then((userCredential) => {
            console.log('✅ Авторизованы анонимно. UID:', userCredential.user.uid);
            setUserId(userCredential.user.uid);
          })
          .catch((error) => {
            console.error('❌ Ошибка авторизации:', error);
          });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading || !userId) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<WeekSchedule userId={userId} />} />
          <Route path="/day/:dayIndex" element={<DaySchedule userId={userId} />} />
          <Route path="/day/:dayIndex/lesson/:lessonIndex" element={<LessonEdit userId={userId} />} />
          <Route path="/items" element={<ItemsToTake userId={userId} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
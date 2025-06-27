import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, TextField, Typography, Container, Box } from '@mui/material';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from '../firebase/config';

const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

const DaySchedule = ({ userId }) => {
  const { dayIndex } = useParams();
  const navigate = useNavigate();
  const [lessonCount, setLessonCount] = useState(0);
  const [lessons, setLessons] = useState([]);
  const dayName = days[dayIndex];

  useEffect(() => {
    const loadSchedule = async () => {
      const docRef = doc(db, "users", userId, "schedule", dayName);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLessons(data.lessons || []);
        setLessonCount(data.lessons?.length || 0);
      }
    };

    loadSchedule();
  }, [userId, dayName]);

  const handleSaveCount = () => {
    const count = parseInt(lessonCount);
    if (isNaN(count)) return;
    
    const newLessons = Array(count).fill().map((_, i) => 
      lessons[i] || { name: `Урок ${i+1}`, items: [] }
    );
    setLessons(newLessons);
  };

  const handleSaveLessons = async () => {
    try {
      const docRef = doc(db, "users", userId, "schedule", dayName);
      await setDoc(docRef, {
        name: dayName,
        lessons: lessons.slice(0, lessonCount),
        order: parseInt(dayIndex) + 1,
        lastUpdated: new Date()
      }, { merge: true });
      
      navigate('/');
    } catch (error) {
      console.error("Ошибка сохранения:", error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" gutterBottom>
        {dayName}
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Количество уроков"
          type="number"
          fullWidth
          value={lessonCount}
          onChange={(e) => setLessonCount(e.target.value)}
          inputProps={{ min: 0 }}
        />
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleSaveCount}
        >
          Установить количество
        </Button>
      </Box>
      
      {lessons.slice(0, lessonCount).map((lesson, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            fullWidth
            value={lesson.name}
            onChange={(e) => {
              const newLessons = [...lessons];
              newLessons[index] = { ...newLessons[index], name: e.target.value };
              setLessons(newLessons);
            }}
          />
          <Button
            sx={{ ml: 1 }}
            onClick={() => navigate(`/day/${dayIndex}/lesson/${index}`)}
          >
            ✏️
          </Button>
        </Box>
      ))}
      
      {lessonCount > 0 && (
        <Button
          fullWidth
          variant="contained"
          color="success"
          sx={{ mt: 2 }}
          onClick={handleSaveLessons}
        >
          Сохранить расписание
        </Button>
      )}
    </Container>
  );
};

export default DaySchedule;
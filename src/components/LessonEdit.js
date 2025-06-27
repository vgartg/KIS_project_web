import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, TextField, Typography, Container, Box } from '@mui/material';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from '../firebase/config';

const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

const LessonEdit = ({ userId }) => {
  const { dayIndex, lessonIndex } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState(['', '', '', '']);
  const dayName = days[dayIndex];

  useEffect(() => {
    const loadItems = async () => {
      const docRef = doc(db, "users", userId, "schedule", dayName);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const lessons = docSnap.data().lessons || [];
        if (lessons[lessonIndex]?.items) {
          const loadedItems = [...lessons[lessonIndex].items];
          while (loadedItems.length < 4) loadedItems.push('');
          setItems(loadedItems.slice(0, 4));
        }
      }
    };

    loadItems();
  }, [userId, dayIndex, lessonIndex]);

  const handleItemChange = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleSave = async () => {
    try {
      const docRef = doc(db, "users", userId, "schedule", dayName);
      const docSnap = await getDoc(docRef);
      
      const currentData = docSnap.exists() ? docSnap.data() : { lessons: [] };
      const updatedLessons = [...currentData.lessons];
      
      updatedLessons[lessonIndex] = {
        ...updatedLessons[lessonIndex],
        items: items.filter(item => item.trim() !== '')
      };

      await setDoc(docRef, {
        ...currentData,
        lessons: updatedLessons
      }, { merge: true });

      navigate(`/day/${dayIndex}`);
    } catch (error) {
      console.error("Ошибка сохранения:", error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" gutterBottom>
        Предметы для урока {parseInt(lessonIndex) + 1}
      </Typography>
      
      {items.map((item, index) => (
        <TextField
          key={index}
          fullWidth
          label={`Предмет ${index + 1}`}
          value={item}
          onChange={(e) => handleItemChange(index, e.target.value)}
          sx={{ mb: 2 }}
        />
      ))}
      
      <Button
        variant="contained"
        fullWidth
        onClick={handleSave}
        sx={{ mt: 2 }}
      >
        Сохранить предметы
      </Button>
    </Container>
  );
};

export default LessonEdit;
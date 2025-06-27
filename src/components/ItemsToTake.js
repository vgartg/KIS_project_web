import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Typography,
  Container, 
  MenuItem, 
  Select, 
  List, 
  ListItem, 
  ListItemText,
  Box
} from '@mui/material';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../firebase/config';

const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

const ItemsToTake = ({ userId }) => {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState('0');
  const [items, setItems] = useState([]);

  useEffect(() => {
    const loadItems = async () => {
      const dayName = days[selectedDay];
      const docRef = doc(db, "users", userId, "schedule", dayName);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const loadedItems = [];
        const data = docSnap.data();
        
        data.lessons?.forEach((lesson, lessonIndex) => {
          lesson.items?.forEach((item) => {
            if (item.trim() !== '') {
              loadedItems.push({
                id: `${lessonIndex}_${item}`,
                lessonNumber: lessonIndex + 1,
                item: item
              });
            }
          });
        });
        
        setItems(loadedItems);
      } else {
        setItems([]);
      }
    };

    loadItems();
  }, [userId, selectedDay]);

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" gutterBottom>
        Взять с собой
      </Typography>
      
      <Select
        value={selectedDay}
        onChange={(e) => setSelectedDay(e.target.value)}
        fullWidth
        sx={{ mb: 3 }}
      >
        {days.map((day, index) => (
          <MenuItem key={index} value={index.toString()}>{day}</MenuItem>
        ))}
      </Select>
      
      <List>
        {items.map((item) => (
          <ListItem key={item.id}>
            <ListItemText
              primary={`Урок ${item.lessonNumber}: ${item.item}`}
            />
          </ListItem>
        ))}
      </List>
      
      <Button
        fullWidth
        variant="outlined"
        sx={{ mt: 2 }}
        onClick={() => navigate('/')}
      >
        Назад
      </Button>
    </Container>
  );
};

export default ItemsToTake;
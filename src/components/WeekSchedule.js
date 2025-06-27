import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Grid, 
  Typography, 
  Container, 
  CircularProgress,
  Paper,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { collection, getDocs, query, orderBy, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from '../firebase/config';

const days = [
  { name: 'Понедельник', order: 1 },
  { name: 'Вторник', order: 2 },
  { name: 'Среда', order: 3 },
  { name: 'Четверг', order: 4 },
  { name: 'Пятница', order: 5 },
  { name: 'Суббота', order: 6 }
];

const WeekSchedule = ({ userId }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);

  // Инициализация расписания
  useEffect(() => {
    const initializeSchedule = async () => {
      try {
        const schedulesData = [];
        
        for (const day of days) {
          const dayRef = doc(db, "users", userId, "schedule", day.name);
          const daySnap = await getDoc(dayRef);
          
          if (!daySnap.exists()) {
            await setDoc(dayRef, {
              name: day.name,
              order: day.order,
              lessons: [],
              lastUpdated: new Date()
            });
            schedulesData.push({ name: day.name, lessons: [] });
          } else {
            schedulesData.push(daySnap.data());
          }
        }
        
        setSchedules(schedulesData.sort((a, b) => a.order - b.order));
      } catch (error) {
        console.error("Ошибка инициализации:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeSchedule();
  }, [userId]);

  if (loading) {
    return (
      <Container maxWidth="sm" style={{ display: 'flex', justifyContent: 'center', paddingTop: 50 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ pb: 4 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ mt: 2 }}>
        Расписание
      </Typography>
      
      {/* Кнопки дней недели */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {schedules.map((day, index) => (
          <Grid item xs={12} sm={6} key={day.name}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => navigate(`/day/${index}`)}
            >
              {day.name}
            </Button>
          </Grid>
        ))}
      </Grid>

      {/* Полное расписание */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Ваше расписание:
        </Typography>
        
        {schedules.map((day) => (
          <Paper key={day.name} elevation={2} sx={{ mb: 3, p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              {day.name}:
            </Typography>
            
            {day.lessons?.length > 0 ? (
              <List dense>
                {day.lessons.map((lesson, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText 
                        primary={`${index + 1}. ${lesson.name || `Урок ${index + 1}`}`}
                        secondary={
                          lesson.items?.length > 0 
                            ? `Взять: ${lesson.items.join(', ')}` 
                            : null
                        }
                      />
                    </ListItem>
                    {index < day.lessons.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Расписание не заполнено
              </Typography>
            )}
          </Paper>
        ))}
      </Box>

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 2 }}
        onClick={() => navigate('/items')}
      >
        Взять с собой
      </Button>
    </Container>
  );
};

export default WeekSchedule;
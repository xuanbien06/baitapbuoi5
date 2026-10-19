// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CourseListScreen from './src/screens/CourseListScreen';
import CourseDetailScreen from './src/screens/CourseDetailScreen';
import CourseFormScreen from './src/screens/CourseFormScreen';
import CategoryScreen from './src/screens/CategoryScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="CourseList"
        screenOptions={{
          headerStyle: { backgroundColor: '#2563EB' },
          headerTintColor: '#FFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="CourseList"
          component={CourseListScreen}
          options={{ title: 'Quản lý Khóa học' }}
        />
        <Stack.Screen
          name="CourseDetail"
          component={CourseDetailScreen}
          options={{ title: 'Chi tiết Khóa học' }}
        />
        <Stack.Screen
          name="CourseForm"
          component={CourseFormScreen}
          options={{ title: 'Thêm / Sửa Khóa học' }}
        />
        <Stack.Screen
          name="CategoryManagement"
          component={CategoryScreen}
          options={{ title: 'Quản lý Danh mục' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
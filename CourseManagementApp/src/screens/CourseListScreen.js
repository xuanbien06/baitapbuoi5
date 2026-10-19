// src/screens/CourseListScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getCourses, getCategories } from '../api/courseApi';

export default function CourseListScreen({ navigation }) {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [coursesData, categoriesData] = await Promise.all([
        getCourses(),
        getCategories(),
      ]);
      setCourses(coursesData);
      setCategories(categoriesData);
    } catch (err) {
      setError('Không thể kết nối đến máy chủ MockAPI. Vui lòng kiểm tra lại mạng hoặc URL!');
    } finally {
      setLoading(false);
    }
  };

  // Tự động tải lại dữ liệu mỗi khi quay về màn hình danh sách
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // Hàm lấy tên danh mục từ categoryId thông qua dữ liệu API
  const getCategoryName = (categoryId) => {
    const found = categories.find((cat) => String(cat.id) === String(categoryId));
    return found ? found.name : 'Chưa phân loại';
  };

  // Lọc khóa học theo từ khóa tìm kiếm và danh mục được chọn
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      ?.toLowerCase()
      .includes(searchQuery.trim().toLowerCase());
    const matchesCategory =
      selectedCategoryId === 'ALL' ||
      String(course.categoryId) === String(selectedCategoryId);
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString('vi-VN') + ' đ';
  };

  const renderCourseItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('CourseDetail', {
          courseId: item.id,
          categoryName: getCategoryName(item.categoryId),
        })
      }
    >
      <Image
        source={{ uri: item.thumbnail || 'https://via.placeholder.com/150' }}
        style={styles.thumbnail}
      />
      <View style={styles.cardBody}>
        <Text style={styles.categoryBadge}>{getCategoryName(item.categoryId)}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.instructor}>GV: {item.instructor}</Text>
        <View style={styles.footerRow}>
          <Text style={styles.price}>{formatCurrency(item.price)}</Text>
          <Text style={styles.duration}>{item.duration} giờ</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Thanh nút chức năng điều hướng nhanh */}
      <View style={styles.topActionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#2563EB' }]}
          onPress={() => navigation.navigate('CourseForm', { mode: 'create' })}
        >
          <Text style={styles.actionBtnText}>+ Thêm khóa học</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#059669' }]}
          onPress={() => navigation.navigate('CategoryManagement')}
        >
          <Text style={styles.actionBtnText}>Quản lý danh mục</Text>
        </TouchableOpacity>
      </View>

      {/* Ô tìm kiếm khóa học theo tên */}
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm khóa học theo tên..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Bộ lọc theo danh mục */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedCategoryId === 'ALL' && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCategoryId('ALL')}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategoryId === 'ALL' && styles.filterTextActive,
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.filterChip,
                String(selectedCategoryId) === String(cat.id) &&
                  styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategoryId(cat.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  String(selectedCategoryId) === String(cat.id) &&
                    styles.filterTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Xử lý trạng thái Loading / Lỗi / Rỗng / Danh sách */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.statusText}>Đang tải dữ liệu khóa học...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : filteredCourses.length === 0 ? (
        <View style={styles.centerBox}>
          <Text style={styles.statusText}>Không tìm thấy khóa học nào phù hợp.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCourseItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          onRefresh={fetchData}
          refreshing={loading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 12 },
  topActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  searchInput: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 10,
  },
  filterContainer: { marginBottom: 12, height: 38 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginRight: 8,
    justifyContent: 'center',
  },
  filterChipActive: { backgroundColor: '#2563EB' },
  filterText: { color: '#374151', fontWeight: '500', fontSize: 13 },
  filterTextActive: { color: '#FFF', fontWeight: 'bold' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  thumbnail: { width: 115, height: 125, backgroundColor: '#E5E7EB' },
  cardBody: { flex: 1, padding: 10, justifyContent: 'space-between' },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  title: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginTop: 4 },
  instructor: { fontSize: 13, color: '#4B5563', marginTop: 2 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  price: { fontSize: 15, fontWeight: 'bold', color: '#DC2626' },
  duration: { fontSize: 12, color: '#6B7280' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  statusText: { marginTop: 10, fontSize: 15, color: '#4B5563', textAlign: 'center' },
  errorText: { fontSize: 15, color: '#DC2626', textAlign: 'center', marginBottom: 12 },
  retryBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: { color: '#FFF', fontWeight: 'bold' },
});
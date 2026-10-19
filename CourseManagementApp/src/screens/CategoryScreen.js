// src/screens/CategoryScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import {
  getCategories,
  getCourses,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../api/courseApi';

export default function CategoryScreen() {
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catData, courseData] = await Promise.all([
        getCategories(),
        getCourses(),
      ]);
      setCategories(catData);
      setCourses(courseData);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu danh mục.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setEditingId(null);
  };

  const handleSaveCategory = async () => {
    if (!name.trim() || !description.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên và mô tả danh mục.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingId) {
        await updateCategory(editingId, {
          name: name.trim(),
          description: description.trim(),
        });
        Alert.alert('Thành công', 'Đã cập nhật danh mục!');
      } else {
        await createCategory({
          name: name.trim(),
          description: description.trim(),
        });
        Alert.alert('Thành công', 'Đã thêm danh mục mới!');
      }
      resetForm();
      await loadData();
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể lưu danh mục.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPress = (category) => {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description);
  };

  const handleDeletePress = (category) => {
    // KIỂM TRA RÀNG BUỘC KHÓA NGOẠI PHÍA ỨNG DỤNG:
    // Đếm số khóa học đang thuộc danh mục này
    const linkedCourses = courses.filter(
      (c) => String(c.categoryId) === String(category.id)
    );

    if (linkedCourses.length > 0) {
      Alert.alert(
        'Không thể xóa danh mục',
        `Danh mục "${category.name}" hiện đang có ${linkedCourses.length} khóa học. Vui lòng xóa hoặc chuyển các khóa học sang danh mục khác trước!`
      );
      return;
    }

    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa danh mục "${category.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteCategory(category.id);
              Alert.alert('Thành công', 'Đã xóa danh mục!');
              await loadData();
            } catch (err) {
              setLoading(false);
              Alert.alert('Lỗi', 'Xóa danh mục thất bại!');
            }
          },
        },
      ]
    );
  };

  const countCoursesInCategory = (catId) => {
    return courses.filter((c) => String(c.categoryId) === String(catId)).length;
  };

  return (
    <View style={styles.container}>
      {/* Form Thêm / Sửa Danh Mục */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>
          {editingId ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Tên danh mục (VD: Thiết kế UI/UX)"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Mô tả danh mục (VD: Figma, Adobe XD)"
          value={description}
          onChangeText={setDescription}
        />
        <View style={styles.formBtnRow}>
          <TouchableOpacity
            style={[styles.saveBtn, submitting && { opacity: 0.7 }]}
            onPress={handleSaveCategory}
            disabled={submitting}
          >
            <Text style={styles.btnText}>
              {editingId ? 'Lưu thay đổi' : '+ Thêm danh mục'}
            </Text>
          </TouchableOpacity>

          {editingId && (
            <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Danh sách Danh Mục */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const count = countCoursesInCategory(item.id);
            return (
              <View style={styles.catItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.catName}>
                    {item.name} ({count} khóa học)
                  </Text>
                  <Text style={styles.catDesc}>{item.description}</Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: '#F59E0B' }]}
                    onPress={() => handleEditPress(item)}
                  >
                    <Text style={styles.smallBtnText}>Sửa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: '#DC2626' }]}
                    onPress={() => handleDeletePress(item)}
                  >
                    <Text style={styles.smallBtnText}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 12 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  formCard: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 14,
    elevation: 2,
  },
  formTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#111827' },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    backgroundColor: '#F9FAFB',
  },
  formBtnRow: { flexDirection: 'row', gap: 10 },
  saveBtn: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: { color: '#FFF', fontWeight: 'bold' },
  cancelBtnText: { color: '#374151', fontWeight: 'bold' },
  catItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 1,
  },
  catName: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  catDesc: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  itemActions: { flexDirection: 'row', gap: 8, marginLeft: 10 },
  smallBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  smallBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
});
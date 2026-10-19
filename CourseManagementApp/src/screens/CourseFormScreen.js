// src/screens/CourseFormScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getCategories, createCourse, updateCourse } from '../api/courseApi';

export default function CourseFormScreen({ route, navigation }) {
  const mode = route.params?.mode || 'create';
  const editingCourse = route.params?.course || null;

  const [title, setTitle] = useState(editingCourse?.title || '');
  const [description, setDescription] = useState(editingCourse?.description || '');
  const [categoryId, setCategoryId] = useState(
    editingCourse?.categoryId ? String(editingCourse.categoryId) : ''
  );
  const [instructor, setInstructor] = useState(editingCourse?.instructor || '');
  const [price, setPrice] = useState(
    editingCourse?.price !== undefined ? String(editingCourse.price) : ''
  );
  const [duration, setDuration] = useState(
    editingCourse?.duration !== undefined ? String(editingCourse.duration) : ''
  );
  const [thumbnail, setThumbnail] = useState(editingCourse?.thumbnail || '');
  const [trailerUrl, setTrailerUrl] = useState(editingCourse?.trailerUrl || '');

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: mode === 'edit' ? 'Cập nhật khóa học' : 'Thêm khóa học mới',
    });

    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await getCategories();
        setCategories(data);
        if (!categoryId && data.length > 0) {
          setCategoryId(String(data[0].id));
        }
      } catch (err) {
        Alert.alert('Lỗi', 'Không thể tải danh sách danh mục từ API.');
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const validateForm = () => {
    if (!title.trim() || !description.trim() || !instructor.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ tên, mô tả và giảng viên.');
      return false;
    }
    const categoryExists = categories.some(
      (cat) => String(cat.id) === String(categoryId)
    );
    if (!categoryId || !categoryExists) {
      Alert.alert('Lỗi danh mục', 'Danh mục đã chọn không hợp lệ hoặc không tồn tại.');
      return false;
    }
    const parsedPrice = Number(price);
    if (price === '' || isNaN(parsedPrice) || parsedPrice < 0) {
      Alert.alert('Lỗi học phí', 'Học phí phải là một số và không được âm (>= 0).');
      return false;
    }
    const parsedDuration = Number(duration);
    if (duration === '' || isNaN(parsedDuration) || parsedDuration <= 0) {
      Alert.alert('Lỗi thời lượng', 'Thời lượng khóa học phải là số lớn hơn 0.');
      return false;
    }
    if (!thumbnail.trim() || !trailerUrl.trim()) {
      Alert.alert('Thiếu URL', 'Vui lòng nhập đầy đủ URL ảnh bìa và URL video trailer.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      categoryId: String(categoryId),
      instructor: instructor.trim(),
      price: Number(price),
      duration: Number(duration),
      thumbnail: thumbnail.trim(),
      trailerUrl: trailerUrl.trim(),
      createdAt:
        editingCourse?.createdAt || new Date().toISOString().split('T')[0],
    };

    try {
      setSubmitting(true);
      if (mode === 'edit' && editingCourse) {
        await updateCourse(editingCourse.id, payload);
        Alert.alert('Thành công', 'Đã cập nhật khóa học!');
      } else {
        await createCourse(payload);
        Alert.alert('Thành công', 'Đã thêm khóa học mới!');
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Lỗi', 'Lưu khóa học thất bại. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCategories) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 8 }}>Đang tải danh mục...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.label}>Tên khóa học *</Text>
      <TextInput
        style={styles.input}
        placeholder="VD: Lập trình React Native nâng cao"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Danh mục khóa học *</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={categoryId}
          onValueChange={(itemValue) => setCategoryId(String(itemValue))}
        >
          {categories.map((cat) => (
            <Picker.Item key={cat.id} label={cat.name} value={String(cat.id)} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Giảng viên *</Text>
      <TextInput
        style={styles.input}
        placeholder="VD: Nguyễn Văn A"
        value={instructor}
        onChangeText={setInstructor}
      />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Học phí (VNĐ) *</Text>
          <TextInput
            style={styles.input}
            placeholder="VD: 500000"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Thời lượng (giờ) *</Text>
          <TextInput
            style={styles.input}
            placeholder="VD: 30"
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
          />
        </View>
      </View>

      <Text style={styles.label}>Mô tả khóa học *</Text>
      <TextInput
        style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
        placeholder="Nhập mô tả nội dung khóa học..."
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>URL Ảnh bìa (Thumbnail) *</Text>
      <TextInput
        style={styles.input}
        placeholder="https://images.unsplash.com/..."
        value={thumbnail}
        onChangeText={setThumbnail}
      />

      {/* Hiển thị ảnh xem trước (Preview) khi nhập URL */}
      {thumbnail.trim() !== '' && (
        <View style={styles.previewBox}>
          <Text style={styles.previewLabel}>Xem trước ảnh bìa:</Text>
          <Image
            source={{ uri: thumbnail.trim() }}
            style={styles.previewImage}
            resizeMode="cover"
          />
        </View>
      )}

      <Text style={styles.label}>URL Video Trailer (.mp4) *</Text>
      <TextInput
        style={styles.input}
        placeholder="https://.../trailer.mp4"
        value={trailerUrl}
        onChangeText={setTrailerUrl}
      />

      <TouchableOpacity
        style={[styles.saveBtn, submitting && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.saveBtnText}>
            {mode === 'edit' ? 'Lưu cập nhật' : 'Tạo khóa học'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 16 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#F9FAFB',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', gap: 12 },
  previewBox: { marginTop: 10, alignItems: 'center' },
  previewLabel: { fontSize: 13, color: '#6B7280', marginBottom: 6, alignSelf: 'flex-start' },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
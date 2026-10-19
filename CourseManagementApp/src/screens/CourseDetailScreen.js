// src/screens/CourseDetailScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getCourseById, getCategories, deleteCourse } from '../api/courseApi';

// Link video MP4 thực tế dự phòng nếu dữ liệu trên MockAPI là link giả example.com
const SAFE_FALLBACK_VIDEO = 'https://www.w3schools.com/html/mov_bbb.mp4';

export default function CourseDetailScreen({ route, navigation }) {
  const { courseId } = route.params;
  const [course, setCourse] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [videoUri, setVideoUri] = useState(SAFE_FALLBACK_VIDEO);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const [courseData, categoriesData] = await Promise.all([
        getCourseById(courseId),
        getCategories(),
      ]);
      setCourse(courseData);

      if (
        courseData.trailerUrl &&
        courseData.trailerUrl.startsWith('http') &&
        !courseData.trailerUrl.includes('example.com')
      ) {
        setVideoUri(courseData.trailerUrl);
      } else {
        setVideoUri(SAFE_FALLBACK_VIDEO);
      }

      const foundCat = categoriesData.find(
        (c) => String(c.id) === String(courseData.categoryId)
      );
      setCategoryName(foundCat ? foundCat.name : 'Chưa phân loại');
    } catch (err) {
      setError('Không thể tải thông tin chi tiết khóa học.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
    }, [courseId])
  );

  const handleOpenVideo = async () => {
    try {
      await Linking.openURL(videoUri);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể mở đường dẫn video này.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa khóa học "${course?.title}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteCourse(courseId);
              Alert.alert('Thành công', 'Đã xóa khóa học!');
              navigation.goBack();
            } catch (err) {
              setLoading(false);
              Alert.alert('Lỗi', 'Xóa khóa học thất bại!');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10 }}>Đang tải chi tiết khóa học...</Text>
      </View>
    );
  }

  if (error || !course) {
    return (
      <View style={styles.centerBox}>
        <Text style={{ color: '#DC2626', marginBottom: 12 }}>{error}</Text>
        <TouchableOpacity style={styles.btnPrimary} onPress={fetchDetail}>
          <Text style={styles.btnText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Image
        source={{ uri: course.thumbnail || 'https://via.placeholder.com/400x200' }}
        style={styles.coverImage}
      />

      <View style={styles.content}>
        <Text style={styles.badge}>{categoryName}</Text>
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.price}>
          {Number(course.price || 0).toLocaleString('vi-VN')} VNĐ
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoItem}>👨‍🏫 Giảng viên: {course.instructor}</Text>
          <Text style={styles.infoItem}>⏱ Thời lượng: {course.duration} giờ</Text>
          <Text style={styles.infoItem}>📅 Ngày tạo: {course.createdAt}</Text>
        </View>

        <Text style={styles.sectionTitle}>Mô tả khóa học</Text>
        <Text style={styles.description}>{course.description}</Text>

        {/* Nút bật/tắt khung Video Trailer */}
        <TouchableOpacity
          style={styles.trailerBtn}
          onPress={() => setShowTrailer(!showTrailer)}
        >
          <Text style={styles.trailerBtnText}>
            {showTrailer ? '▲ Ẩn Video Trailer' : '▶ Xem Trailer Khóa Học'}
          </Text>
        </TouchableOpacity>

        {/* Khung trình phát Video Trailer an toàn trên mọi máy ảo */}
        {showTrailer && (
          <View style={styles.videoContainer}>
            <ImageBackground
              source={{ uri: course.thumbnail || 'https://via.placeholder.com/400x200' }}
              style={styles.videoBackdrop}
              imageStyle={{ opacity: 0.45 }}
            >
              <TouchableOpacity style={styles.playCircle} onPress={handleOpenVideo}>
                <Text style={styles.playIcon}>▶</Text>
              </TouchableOpacity>
              <Text style={styles.videoHintText}>
                Nhấn để phát video MP4 ({course.title})
              </Text>
            </ImageBackground>

            <View style={styles.videoFooter}>
              <Text style={styles.videoUrlText} numberOfLines={1}>
                🔗 Nguồn: {videoUri}
              </Text>
              <TouchableOpacity style={styles.openPlayerBtn} onPress={handleOpenVideo}>
                <Text style={styles.openPlayerBtnText}>Phát Video ↗</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Các thao tác Sửa & Xóa */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#F59E0B' }]}
            onPress={() =>
              navigation.navigate('CourseForm', { mode: 'edit', course })
            }
          >
            <Text style={styles.btnText}>✏️ Sửa khóa học</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#DC2626' }]}
            onPress={handleDelete}
          >
            <Text style={styles.btnText}>🗑️ Xóa khóa học</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  coverImage: { width: '100%', height: 220, backgroundColor: '#E5E7EB' },
  content: { padding: 16 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    color: '#1D4ED8',
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginTop: 8 },
  price: { fontSize: 20, fontWeight: 'bold', color: '#DC2626', marginVertical: 8 },
  infoBox: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginVertical: 10,
  },
  infoItem: { fontSize: 14, color: '#374151', marginVertical: 3 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginTop: 10 },
  description: { fontSize: 15, color: '#4B5563', lineHeight: 22, marginTop: 6 },
  trailerBtn: {
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 18,
  },
  trailerBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  videoContainer: {
    marginTop: 12,
    backgroundColor: '#111827',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#374151',
  },
  videoBackdrop: {
    width: '100%',
    height: 190,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  playIcon: { color: '#FFF', fontSize: 26, marginLeft: 4 },
  videoHintText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  videoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#1F2937',
  },
  videoUrlText: { flex: 1, color: '#9CA3AF', fontSize: 12, marginRight: 10 },
  openPlayerBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  openPlayerBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
});
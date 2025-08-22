import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

class ApiError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR') {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

// Generic CRUD operations
export const api = {
  // Users
  async createUser(userData) {
    try {
      const usersRef = collection(db, 'users');
      const docRef = await addDoc(usersRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, ...userData };
    } catch (error) {
      throw new ApiError(`Failed to create user: ${error.message}`, 'CREATE_USER_ERROR');
    }
  },

  async getUser(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new ApiError('User not found', 'USER_NOT_FOUND');
      }
      return { id: userDoc.id, ...userDoc.data() };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Failed to get user: ${error.message}`, 'GET_USER_ERROR');
    }
  },

  async updateUser(userId, userData) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp()
      });
      return { id: userId, ...userData };
    } catch (error) {
      throw new ApiError(`Failed to update user: ${error.message}`, 'UPDATE_USER_ERROR');
    }
  },

  // Tutors
  async getTutors(filters = {}) {
    try {
      let tutorsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'tutor')
      );

      if (filters.verified !== undefined) {
        tutorsQuery = query(tutorsQuery, where('verified', '==', filters.verified));
      }

      if (filters.orderBy) {
        tutorsQuery = query(tutorsQuery, orderBy(filters.orderBy, filters.order || 'desc'));
      }

      if (filters.limit) {
        tutorsQuery = query(tutorsQuery, limit(filters.limit));
      }

      const querySnapshot = await getDocs(tutorsQuery);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new ApiError(`Failed to get tutors: ${error.message}`, 'GET_TUTORS_ERROR');
    }
  },

  // Subjects
  async getTutorSubjects(tutorId) {
    try {
      const subjectsQuery = query(
        collection(db, 'subjects'),
        where('tutorId', '==', tutorId)
      );
      const querySnapshot = await getDocs(subjectsQuery);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new ApiError(`Failed to get tutor subjects: ${error.message}`, 'GET_SUBJECTS_ERROR');
    }
  },

  async createSubject(subjectData) {
    try {
      const subjectsRef = collection(db, 'subjects');
      const docRef = await addDoc(subjectsRef, {
        ...subjectData,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...subjectData };
    } catch (error) {
      throw new ApiError(`Failed to create subject: ${error.message}`, 'CREATE_SUBJECT_ERROR');
    }
  },

  // Bookings
  async createBooking(bookingData) {
    try {
      const bookingsRef = collection(db, 'bookings');
      const docRef = await addDoc(bookingsRef, {
        ...bookingData,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...bookingData };
    } catch (error) {
      throw new ApiError(`Failed to create booking: ${error.message}`, 'CREATE_BOOKING_ERROR');
    }
  },

  async getUserBookings(userId, role = 'student') {
    try {
      const field = role === 'student' ? 'studentId' : 'tutorId';
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where(field, '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(bookingsQuery);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new ApiError(`Failed to get user bookings: ${error.message}`, 'GET_BOOKINGS_ERROR');
    }
  },

  async updateBookingStatus(bookingId, status) {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { status });
      return { id: bookingId, status };
    } catch (error) {
      throw new ApiError(`Failed to update booking status: ${error.message}`, 'UPDATE_BOOKING_ERROR');
    }
  },

  // Reviews
  async createReview(reviewData) {
    try {
      const reviewsRef = collection(db, 'reviews');
      const docRef = await addDoc(reviewsRef, {
        ...reviewData,
        createdAt: serverTimestamp()
      });
      
      // Update tutor rating
      await this.updateTutorRating(reviewData.tutorId);
      
      return { id: docRef.id, ...reviewData };
    } catch (error) {
      throw new ApiError(`Failed to create review: ${error.message}`, 'CREATE_REVIEW_ERROR');
    }
  },

  async getTutorReviews(tutorId) {
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('tutorId', '==', tutorId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(reviewsQuery);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new ApiError(`Failed to get tutor reviews: ${error.message}`, 'GET_REVIEWS_ERROR');
    }
  },

  async updateTutorRating(tutorId) {
    try {
      const reviews = await this.getTutorReviews(tutorId);
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;
      
      await this.updateUser(tutorId, {
        ratingAvg: Number(avgRating.toFixed(2)),
        ratingCount: reviews.length
      });
    } catch (error) {
      throw new ApiError(`Failed to update tutor rating: ${error.message}`, 'UPDATE_RATING_ERROR');
    }
  },

  // Availability
  async getTutorAvailability(tutorId) {
    try {
      const weeklyQuery = query(
        collection(db, 'weeklyAvailability'),
        where('tutorId', '==', tutorId)
      );
      const overridesQuery = query(
        collection(db, 'availabilityOverrides'),
        where('tutorId', '==', tutorId)
      );

      const [weeklySnapshot, overridesSnapshot] = await Promise.all([
        getDocs(weeklyQuery),
        getDocs(overridesQuery)
      ]);

      return {
        weekly: weeklySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        overrides: overridesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      };
    } catch (error) {
      throw new ApiError(`Failed to get tutor availability: ${error.message}`, 'GET_AVAILABILITY_ERROR');
    }
  },

  async setWeeklyAvailability(tutorId, availability) {
    try {
      const batch = writeBatch(db);
      
      // Delete existing weekly availability
      const existingQuery = query(
        collection(db, 'weeklyAvailability'),
        where('tutorId', '==', tutorId)
      );
      const existingSnapshot = await getDocs(existingQuery);
      existingSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Add new availability slots
      availability.forEach(slot => {
        const docRef = doc(collection(db, 'weeklyAvailability'));
        batch.set(docRef, {
          tutorId,
          ...slot
        });
      });

      await batch.commit();
      return availability;
    } catch (error) {
      throw new ApiError(`Failed to set weekly availability: ${error.message}`, 'SET_AVAILABILITY_ERROR');
    }
  }
};

export default api;

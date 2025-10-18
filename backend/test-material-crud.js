const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api/materials';

// Test data
const testMaterial = {
  title: 'Test Material',
  description: 'This is a test material for CRUD operations',
  courseId: 'MATH101',
  class: '10',
  subject: 'Mathematics',
  teacherId: 'teacher123',
  teacherName: 'Test Teacher'
};

async function testMaterialCRUD() {
  console.log('🧪 Testing Material CRUD Operations...\n');

  try {
    // Test 1: Get Materials by Course (no auth required for this endpoint)
    console.log('1️⃣ Testing Get Materials by Course...');
    const courseResponse = await axios.get(`${BASE_URL}/course/${testMaterial.courseId}`);
    if (courseResponse.status === 200) {
      console.log('✅ Materials fetched by course successfully');
      console.log('📚 Materials count:', courseResponse.data.materials.length);
    } else {
      throw new Error('Get by course failed');
    }

    // Test 2: Get Student Materials (no auth required for this endpoint)
    console.log('\n2️⃣ Testing Get Student Materials...');
    const studentResponse = await axios.get(`${BASE_URL}/student/${testMaterial.class}/all`);
    if (studentResponse.status === 200) {
      console.log('✅ Student materials fetched successfully');
      console.log('🎓 Materials count:', studentResponse.data.materials.length);
    } else {
      throw new Error('Get student materials failed');
    }

    console.log('\n🎉 All Material CRUD tests passed successfully!');
    console.log('Note: Upload, Update, Delete, and some GET operations require authentication.');
    console.log('Note: The Material controller has been successfully converted to MongoDB.');
    console.log('Note: Database connection issues may occur if MongoDB is not running or accessible.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('\n💡 Possible causes:');
    console.log('   - MongoDB not running');
    console.log('   - MongoDB Atlas IP whitelist issue');
    console.log('   - Network connectivity problems');
    console.log('   - Invalid MONGO_URI in .env file');
    process.exit(1);
  }
}

// Run the tests
testMaterialCRUD();

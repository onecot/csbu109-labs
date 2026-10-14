// Import modules
require('dotenv').config();
const mongoose = require('mongoose');

// Connect to the MongoDB database
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log("-> Connected to MongoDB successfully via Mongoose ODM!"))
    .catch(err => console.log("MongoDB connection error:", err));

// Define the Mongoose schema with validation rules
const studentSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [2, 'Full name must be at least 2 characters long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }]
}, {
    timestamps: true
});

const courseSchema = new mongoose.Schema({
    courseCode: {
        type: String,
        required: [true, 'Course code is required'],
        unique: true,
        minlength: [4, 'Course code must be at least 4 characters long']
    },
    courseName: {
        type: String,
        required: [true, 'Course name is required'],
        minlength: [4, 'Course name must be at least 4 characters long']
    },
    maxStudents: {
        type: Number,
        required: [true, 'Number of max students is required'],
        min: [0, 'Number of max students must be non-zero.']
    },
    availableSlots: {
        type: Number,
        required: [true, 'Number of available slots is required']
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }]
}, {
    timestamps: true
});

// Create Student & Course model
const Student = mongoose.model('Student', studentSchema);
const Course = mongoose.model('Course', courseSchema);

// 0. Create sample data functions
async function createStudent(fullName, email) {
    try {
        const newStudent = await Student.create({
            fullName: fullName,
            email: email
        });

        // console.log("Created new user:", newStudent);
        return newStudent;
    } catch(error) {
        console.log(`⊛ Create ${fullName} student error:`, error.message);
    }
}

async function createCourse(courseCode, courseName, maxStudents, availableSlots) {
    try {
        const newCourse = await Course.create({
            courseCode: courseCode,
            courseName: courseName,
            maxStudents: maxStudents,
            availableSlots: availableSlots
        });

        // console.log("Created new course:", newCourse);
        return newCourse;
    } catch(error) {
        console.log(`⊛ Create ${courseCode} course error:`, error.message);
    }
}

// 1. Enroll in a course
async function enrollCourse(studentId, courseId) {
    try {
        const student = await Student.findById(studentId);
        const course = await Course.findById(courseId);

        if(!student) throw new Error(`Student not found!`);
        if(!course) throw new Error(`Course not found!`);

        if(course.students.some(id => id.equals(studentId)))
            throw new Error(`${student.fullName} already enrolled ${course.courseCode}.`)

        if(course.availableSlots <= 0)
            throw new Error(`${course.courseCode} slots are not available.`);
        
        course.students.push(studentId);
        course.availableSlots -= 1;
        student.courses.push(courseId);

        // Update to Database
        await course.save();
        await student.save();

        console.log(`${student.fullName} enrolled ${course.courseCode} successfully!`);
    } catch(error) {
        console.log("⊛ Enroll course operation error:", error.message);
    }
}

async function dropCourse(studentId, courseId) {
    try {
        const student = await Student.findById(studentId);
        const course = await Course.findById(courseId);

        if(!student) throw new Error(`Student not found!`);
        if(!course) throw new Error(`Course not found!`);

        if(!course.students.some(id => id.equals(studentId)))
            throw new Error(`Student ${student.fullName} did not enroll ${course.courseCode}.`);
        
        course.students = course.students.filter(id => !(id.equals(studentId)));
        course.availableSlots += 1;
        student.courses = student.courses.filter(id => !(id.equals(courseId)));

        // Update to Database
        await course.save();
        await student.save();

        console.log(`${student.fullName} dropped ${course.courseCode} successfully!`);
    } catch(error) {
        console.log("⊛ Drop course operation error:", error.message);
    }
}

async function homework2() {
    try {
        // Clear old sample
        await Student.deleteMany({});
        await Course.deleteMany({});
        
        // Create students
        const student1 = await createStudent("Le Minh Tan", "leminhtan@example.com");
        const student2 = await createStudent("Nguyen Tri Nhan", "nguyentrinhan@example.com");
        const student3 = await createStudent("Le Phuc Hieu", "lephuchieu@example.com");
        // console.log("Created students: ", student1, student2, student3);

        // Create courses
        const course1 = await createCourse("CSBU109", "Backend & Database Development", 30, 30);
        const course2 = await createCourse("SS009", "Scientific Socialism", 60, 0);
        
        await enrollCourse(student1._id, course1._id);
        await enrollCourse(student2._id, course2._id);
        await dropCourse(student3._id, course1._id);
        await dropCourse(student1._id, course1._id);

        // enrollCourse();
    } catch(error) {
        console.log("⊛ Mongoose operation error:", error.message);
    } finally {
        await mongoose.connection.close();
        console.log("-> Mongoose connection closed.");
    }
}

homework2();
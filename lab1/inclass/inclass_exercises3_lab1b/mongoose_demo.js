// Import modules
require('dotenv').config();
const mongoose = require('mongoose');

// Connect to the MongoDB database
const MONGO_URI = process.env.MONGO_URI
                || 'mongodb://127.0.0.1:27017/shop_mongoose_db';

mongoose.connect(MONGO_URI)
    .then(() => console.log("-> Connected to MongoDB successfully via Mongoose ODM!"))
    .catch(err => console.error("MongoDB connection error:", err));

// Define the Mongoose schema with validation rules
const userSchema = new mongoose.Schema({
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
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        validate: {
            validator: function (value) {
                return /^(03|05|07|08|09)\d{8}$/.test(value);
            },
            message: 'Invalid Vietnamese phone number'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    age: {
        type: Number,
        min: [18, 'User age must be at least 18'],
        max: [100, 'Invalid age']
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'manager'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

// Question 2: Create a virtual field displayInfo
userSchema.virtual('displayInfo')
    .get(function() {
        return `${this.fullName} <${this.email}> [${this.role.toUpperCase()}]`;
    })

// Question 3: Add static method findActiveByRole(roleName)
userSchema.statics.findActiveByRole = function(roleName) {
    return this.find({
        role: roleName,
        isActive: true
    }).sort({ fullName: 1 });
};

// Question 4: Add instance method isDeleted
userSchema.methods.softDelete = async function() {
    this.isDeleted = true;
    this.isActive = false;
    await this.save();
    return this;
}

// Add a pre-save middleware hook
userSchema.pre('save', function() {
    // Question 5: Hashing the password before saving
    if (this.isModified('password')) {
        this.password = `hashed_${this.password}`;
    }

    console.log(`[Middleware Pre-save] Preparing to save user: ${this.fullName}`);
});

// Question 5: Auto apply isDeleted: true filter when finding
userSchema.pre(/^find/, function() {
    this.where({ isDeleted: false });
});


// Create the model from the schema
const User = mongoose.model('User', userSchema);

// Run CRUD operations
async function runMongooseCRUD() {
    try {
        // Clear old data
        await User.deleteMany({});

        // --- C - CREATE ---
        const newUser = await User.create({
            fullName: "Le Minh Tan",
            email: "tanle@example.com",
            phone: "0912345678",
            age: 22,
            role: "admin"
        });
        console.log("1. [CREATE] Successfully created new user:", newUser);

        // --- R - READ ---
        const foundUser = await User.findOne({ email: "tanle@example.com" });
        console.log("2. [READ] Found user by email:", foundUser.fullName);

        // --- U - UPDATE ---
        const updatedUser = await User.findByIdAndUpdate(
            newUser._id,
            { age: 23, role: "manager" },
            { returnDocument: 'after', runValidators: true } // Return the new document & enable validation
        );
        console.log("3. [UPDATE] Succesfully updated user:", updatedUser);

        // --- D - DELETE ---
        // await User.findByIdAndDelete(newUser._id);
        // console.log("4. [DELETE] User deleted succesfully.");
    } catch (error) {
        console.error("Mongoose validation/operation error:", error.message);
    } finally {
        await mongoose.connection.close();
        console.log("-> Mongoose connection closed.");
    }
}

// Question 1
async function insertBadlyPhone() {
    try {
        console.log("Question 1, try to insert badly formatted phone number...");
        // CREATE a user
        const newUser = await User.create({
            fullName: "Nguyen Van A",
            email: "anguyen@example.com",
            phone: "011234567",
            age: 22
        });
    } catch (error) {
        console.error("Expected validation error:", error);
    } finally {
        await mongoose.connection.close();
        console.log("-> Mongoose connection closed.");
    }
}

// Question 2
async function testDisplayInfo() {
    try {
        console.log("Question 2, test virtual field displayInfo...");
        // CREATE a user
        const newUser = await User.create({
            fullName: "Nguyen Van A",
            email: "anguyen@example.com",
            phone: "0312345678",
            age: 22
        });

        console.log('Display info:', newUser.displayInfo);
        console.log('JSON user:', newUser.toJSON());
    } catch (error) {
        console.error("Mongoose validation/operation error:", error);
    } finally {
        await mongoose.connection.close();
        console.log("-> Mongoose connection closed.");
    }
}

// Question 3
async function testFindActiveByRole() {
    try {
        await User.deleteMany({});

        await User.create([
            {
                fullName: "Tran Thi Mai",
                email: "mai@example.com",
                phone: "0912345678",
                age: 24,
                role: "user",
                isActive: true
            },
            {
                fullName: "Le Minh Tan",
                email: "tan@example.com",
                phone: "0912345679",
                age: 22,
                role: "admin",
                isActive: true
            },
            {
                fullName: "Nguyen Van An",
                email: "an@example.com",
                phone: "0987654321",
                age: 25,
                role: "manager",
                isActive: false
            }
        ]);

        const activeAdmins = await User.findActiveByRole("admin");
        console.log("Active admins:", activeAdmins);
    } catch (error) {
        console.error("Question 3 error:", error.message);
    } finally {
        await mongoose.connection.close();
    }
}

// Question 4
async function testSoftDelete() {
    try {
        const user = await User.findOne({ email: "tan@example.com" });

        if (!user) {
            throw new Error("User not found");
        }

        const deletedUser = await user.softDelete();

        console.log("Soft-deleted user:", {
            fullName: deletedUser.fullName,
            isDeleted: deletedUser.isDeleted,
            isActive: deletedUser.isActive
        });
    } catch (error) {
        console.error("Question 4 error:", error.message);
    } finally {
        await mongoose.connection.close();
    }
}

// Question 5
async function testMiddlewareHooks() {
    try {
        console.log("Question 5, testing middleware hooks...");

        await User.deleteMany({});

        const activeUser = await User.create({
            fullName: "Active User",
            email: "active@example.com",
            phone: "0912345678",
            password: "active123",
            age: 22,
            role: "user"
        });

        const userToDelete = await User.create({
            fullName: "Deleted User",
            email: "deleted@example.com",
            phone: "0987654321",
            password: "delete123",
            age: 25,
            role: "user"
        });

        console.log("Hashed password:", activeUser.password);

        await userToDelete.softDelete();

        console.log("Soft-deleted flags:", {
            isDeleted: userToDelete.isDeleted,
            isActive: userToDelete.isActive
        });

        const visibleUsers = await User.find({});
        const hiddenUser = await User.findOne({
            email: "deleted@example.com"
        });

        console.log("Users returned by find:", visibleUsers.map(user => user.email));
        console.log("Deleted user returned by findOne:", hiddenUser);
    } catch (error) {
        console.error("Question 5 error:", error.message);
    } finally {
        await mongoose.connection.close();
        console.log("-> Mongoose connection closed.");
    }
}

testMiddlewareHooks();
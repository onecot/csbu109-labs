#### 1. Create **`blog_db`** database and the **`posts`** collection. Insert at least 3 posts.

```js
use blog_db

db.posts.insertMany([
  {
    title: "Getting Started with Nodejs Express",
    category: "Tech",
    views: 150,
    author: { name: "Tran Van B", email: "tranvanb@gmail.com" },
    tags: ["nodejs", "express", "backend"],
    comments: [
			{ user: "Tan", content: "Very clear tutorial, thanks!", created_at: new Date("2026-09-20") },
			{ user: "Long", content: "Waiting for part 2 about JWT", created_at: new Date("2026-09-21") }
    ]
  },
  {
    title: "Understanding Async Await in JavaScript",
    category: "Tech",
    views: 85,
    author: { name: "Le Thi C", email: "lethic@gmail.com" },
    tags: ["nodejs", "javascript", "async"],
    comments: [
			{ user: "Thai", content: "Finally understand event loop", created_at: new Date("2026-10-01") }
    ]
  },
  {
    title: "My Trip to Da Lat",
    category: "Travel",
    views: 200,
    author: { name: "Pham Van D", email: "phamvand@gmail.com" },
    tags: ["travel", "dalat", "experience"],
    comments: [
			{ user: "Tan", content: "Nice photos", created_at: new Date("2026-10-05") }
    ]
  }
])
```

#### 2. **Query 1:** Find posts in the 'Tech' category **AND** with views of 100 or more

```js
db.posts.find({
  category: "Tech",
  views: { $gte: 100 }
})
```

#### 3. **Query 2:** Find all posts tagged with 'nodejs'.

```js
db.posts.find({
  tags: "nodejs"
})
```

#### 4. **Update:** Add new comment to comments array.
Choose specific post by title (using the **`$push`** operator) and increment its views by count by 1 (using the **`$inc`** operator).

```js
db.posts.updateOne(
  { title: "Understanding Async Await in JavaScript" },
	{
    $push: {
      comments: {
        user: "Tan",
        content: "Just tried the examples, works perfectly on Node 20",
        created_at: new Date("2026-10-08")
      }
    },
    $inc: {
      views: 1
    }
  }
)
```

#### 5. **Aggregation:** Calculate the total number of views (**`totalViews`**) and the total number of posts (**`totalPosts`**), grouped by category.

```js
db.posts.aggregate([
  {
    $group: {
      _id: "$category",
      totalViews: { $sum: "$views" },
      totalPosts: { $sum: 1 }
    }
  }
])
```
-- 1. CREATE the database
CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

-- 2. CREATE the authors table
CREATE TABLE IF NOT EXISTS authors(
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_name VARCHAR(100) NOT NULL,
    nationality VARCHAR(100) NOT NULL
);

-- 3. CREATE the books table
CREATE TABLE IF NOT EXISTS books(
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    author_id INT NOT NULL,
    category VARCHAR(50),
    publish_year INT,
    FOREIGN KEY (author_id) REFERENCES authors(id)
);

-- 4. CREATE the borrow_records table
CREATE TABLE IF NOT EXISTS borrow_records(
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    borrower_name VARCHAR(100) NOT NULL,
    borrow_date TIMESTAMP NOT NULL,
    return_date TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id)
);

-- 5. INSERT 3 sample records int each table
-- 5.1 INSERT into authors
INSERT INTO authors(author_name, nationality) VALUES
('William Shakespeare', 'English'),
('Leo Tolstoy', 'Russian'),
('Fyodor Dostoevsky', 'Russian');

-- 5.2 INSERT into books
INSERT INTO books(title, author_id, category, publish_year) VALUES
('Hamlet', 1, 'Tragic Drama', 1601),
('War and Peace', 2, 'Literary Realism', 1869),
('Crime and Punishment', 3, 'Psychological Realism', 1866);

-- 5.3 INSERT into borrow_records
INSERT INTO borrow_records(book_id, borrower_name, borrow_date, return_date) VALUES
(1, 'Tan', '2026-10-08 14:30:00', NULL),
(2, 'Thai', '2026-09-15 09:45:00', '2026-10-02 16:05:00'),
(3, 'Long', '2026-10-08 10:23:58', '2026-10-13 08:30:00');

-- 6. JOIN across all 3 tables
SELECT
    books.title AS 'Book Title',
    authors.author_name AS 'Author Name',
    borrow_records.borrower_name AS 'Borrower Name',
    borrow_records.borrow_date AS 'Borrow Date'
FROM books
INNER JOIN authors ON books.author_id = authors.id
INNER JOIN borrow_records ON books.id = borrow_records.book_id;

const registrationForm = document.getElementById('registration-form');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutButton = document.getElementById('logout-button');

const displayUsername = document.getElementById('display-username');
const displayUserId = document.getElementById('display-user-id');
const detailFullname = document.getElementById('detail-fullname');
const detailEmail = document.getElementById('detail-email');
const detailCollege = document.getElementById('detail-college');
const detailBranch = document.getElementById('detail-branch');
const detailYear = document.getElementById('detail-year');

const availableBooksTableBody = document.querySelector('#available-books-table tbody');
const issuedBooksTableBody = document.querySelector('#issued-books-table tbody');

const messageDisplay = document.getElementById('message-display');

const FINE_PER_DAY = 5;
const ISSUE_DURATION_DAYS = 14;

function showMessage(message, type = 'info') {
    if (messageDisplay) {
        messageDisplay.textContent = message;
        messageDisplay.classList.remove('bg-red-500', 'bg-green-500', 'bg-blue-500');

        if (type === 'success') {
            messageDisplay.classList.add('bg-green-500');
        } else if (type === 'error') {
            messageDisplay.classList.add('bg-red-500');
        } else {
            messageDisplay.classList.add('bg-blue-500');
        }

        messageDisplay.classList.add('show');
        setTimeout(() => {
            messageDisplay.classList.remove('show');
        }, 3000);
    }
}

function initializeBooks() {
    if (!localStorage.getItem('books')) {
        const defaultBooks = [
            { id: 'b001', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0743273565', isIssued: false, issuedByUserId: null, issueDate: null, dueDate: null },
            { id: 'b002', title: '1984', author: 'George Orwell', isbn: '978-0451524935', isIssued: false, issuedByUserId: null, issueDate: null, dueDate: null },
            { id: 'b003', title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '978-0061120084', isIssued: false, issuedByUserId: null, issueDate: null, dueDate: null },
            { id: 'b004', title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '978-0141439518', isIssued: false, issuedByUserId: null, issueDate: null, dueDate: null },
            { id: 'b005', title: 'The Hitchhiker\'s Guide to the Galaxy', author: 'Douglas Adams', isbn: '978-0345391803', isIssued: false, issuedByUserId: null, issueDate: null, dueDate: null },
            { id: 'b006', title: 'Dune', author: 'Frank Herbert', isbn: '978-0441013593', isIssued: false, issuedByUserId: null, issueDate: null, dueDate: null }
        ];
        localStorage.setItem('books', JSON.stringify(defaultBooks));
    }
}

function calculateFine(issueDateStr) {
    const issueDate = new Date(issueDateStr);
    const dueDate = new Date(issueDate.getTime() + ISSUE_DURATION_DAYS * 24 * 60 * 60 * 1000);
    const currentDate = new Date();

    if (currentDate <= dueDate) {
        return 0;
    }

    const timeDiff = currentDate.getTime() - dueDate.getTime();
    const daysOverdue = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysOverdue * FINE_PER_DAY;
}

function renderBooks() {
    if (availableBooksTableBody && issuedBooksTableBody) {
        const books = JSON.parse(localStorage.getItem('books') || '[]');
        const loggedInUserId = localStorage.getItem('loggedInUserId');

        availableBooksTableBody.innerHTML = '';
        issuedBooksTableBody.innerHTML = '';

        books.forEach(book => {
            const availableRow = availableBooksTableBody.insertRow();
            availableRow.insertCell().textContent = book.title;
            availableRow.insertCell().textContent = book.author;
            availableRow.insertCell().textContent = book.isbn;
            const statusCell = availableRow.insertCell();
            const actionsCell = availableRow.insertCell();

            if (book.isIssued) {
                statusCell.textContent = 'Issued';
                statusCell.classList.add('status-issued');
                if (book.issuedByUserId !== loggedInUserId) {
                    const issuedBySpan = document.createElement('span');
                    issuedBySpan.textContent = ` (by ${book.issuedByUserId.substring(5, 10)}...)`;
                    statusCell.appendChild(issuedBySpan);
                    const disabledButton = document.createElement('button');
                    disabledButton.textContent = 'Issued';
                    disabledButton.classList.add('disabled-btn');
                    disabledButton.disabled = true;
                    actionsCell.appendChild(disabledButton);
                } else {
                    const issuedButton = document.createElement('button');
                    issuedButton.textContent = 'Issued by you';
                    issuedButton.classList.add('disabled-btn');
                    issuedButton.disabled = true;
                    actionsCell.appendChild(issuedButton);
                }
            } else {
                statusCell.textContent = 'Available';
                statusCell.classList.add('status-available');
                const issueButton = document.createElement('button');
                issueButton.textContent = 'Issue';
                issueButton.classList.add('issue-btn');
                issueButton.addEventListener('click', () => issueBook(book.id, loggedInUserId));
                actionsCell.appendChild(issueButton);
            }

            if (book.isIssued && book.issuedByUserId === loggedInUserId) {
                const issuedRow = issuedBooksTableBody.insertRow();
                issuedRow.insertCell().textContent = book.title;
                issuedRow.insertCell().textContent = book.author;
                issuedRow.insertCell().textContent = new Date(book.issueDate).toLocaleDateString();
                issuedRow.insertCell().textContent = new Date(new Date(book.issueDate).getTime() + ISSUE_DURATION_DAYS * 24 * 60 * 60 * 1000).toLocaleDateString();

                const fineAmount = calculateFine(book.issueDate);
                const fineCell = issuedRow.insertCell();
                if (fineAmount > 0) {
                    fineCell.textContent = `$${fineAmount.toFixed(2)}`;
                    fineCell.classList.add('status-overdue');
                } else {
                    fineCell.textContent = 'No fine';
                }

                const returnActionsCell = issuedRow.insertCell();
                const returnButton = document.createElement('button');
                returnButton.textContent = 'Return';
                returnButton.classList.add('return-btn');
                returnButton.addEventListener('click', () => returnBook(book.id, loggedInUserId));
                returnActionsCell.appendChild(returnButton);
            }
        });

        if (availableBooksTableBody.children.length === 0) {
            const row = availableBooksTableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 5;
            cell.textContent = 'No books available at the moment.';
            cell.classList.add('text-center', 'py-4', 'text-gray-500');
        }

        if (issuedBooksTableBody.children.length === 0) {
            const row = issuedBooksTableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 6;
            cell.textContent = 'You have not issued any books.';
            cell.classList.add('text-center', 'py-4', 'text-gray-500');
        }
    }
}


function issueBook(bookId, userId) {
    let books = JSON.parse(localStorage.getItem('books') || '[]');
    const bookIndex = books.findIndex(b => b.id === bookId);

    if (bookIndex !== -1 && !books[bookIndex].isIssued) {
        books[bookIndex].isIssued = true;
        books[bookIndex].issuedByUserId = userId;
        books[bookIndex].issueDate = new Date().toISOString();
        localStorage.setItem('books', JSON.stringify(books));
        showMessage(`Successfully issued "${books[bookIndex].title}".`, 'success');
        renderBooks();
    } else {
        showMessage('Book is already issued or not found.', 'error');
    }
}

function returnBook(bookId, userId) {
    let books = JSON.parse(localStorage.getItem('books') || '[]');
    const bookIndex = books.findIndex(b => b.id === bookId && b.issuedByUserId === userId);

    if (bookIndex !== -1) {
        const fine = calculateFine(books[bookIndex].issueDate);
        let returnMessage = `Successfully returned "${books[bookIndex].title}".`;
        if (fine > 0) {
            returnMessage += ` Fine: $${fine.toFixed(2)}.`;
        }
        showMessage(returnMessage, 'success');

        books[bookIndex].isIssued = false;
        books[bookIndex].issuedByUserId = null;
        books[bookIndex].issueDate = null;
        localStorage.setItem('books', JSON.stringify(books));
        renderBooks();
    } else {
        showMessage('Book not found or not issued by you.', 'error');
    }
}

function checkLoginStatusAndRedirect() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loggedInUserEmail = localStorage.getItem('loggedInUserEmail');
    const currentPage = window.location.pathname.split('/').pop();

    initializeBooks();

    if (isLoggedIn && loggedInUserEmail) {
        if (currentPage === 'login.html' || currentPage === 'register.html' || currentPage === '') {
            window.location.href = 'library.html';
        } else if (currentPage === 'library.html') {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const currentUser = users.find(user => user.email === loggedInUserEmail);

            if (currentUser) {
                if (displayUsername) displayUsername.textContent = currentUser.fullName;
                if (displayUserId) displayUserId.textContent = currentUser.userId || 'N/A';
                if (detailFullname) detailFullname.textContent = currentUser.fullName;
                if (detailEmail) detailEmail.textContent = currentUser.email;
                if (detailCollege) detailCollege.textContent = currentUser.collegeName;
                if (detailBranch) detailBranch.textContent = currentUser.branch;
                if (detailYear) detailYear.textContent = currentUser.year;
                renderBooks();
            } else {
                logoutUser();
            }
        }
    } else {
        if (currentPage === 'library.html') {
            window.location.href = 'login.html';
        } else if (currentPage === '' || currentPage === 'index.html') {
            window.location.href = 'register.html';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (registrationForm) {
        registrationForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const fullName = document.getElementById('reg-fullname').value;
            const fatherName = document.getElementById('reg-fathername').value;
            const mobile = document.getElementById('reg-mobile').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const collegeName = document.getElementById('reg-college-name').value;
            const enrollmentNumber = document.getElementById('reg-enrollment-number').value;
            const branch = document.getElementById('reg-branch').value;
            const year = document.getElementById('reg-year').value;

            let users = JSON.parse(localStorage.getItem('users') || '[]');

            const userExists = users.some(user => user.email === email);
            if (userExists) {
                showMessage('This email is already registered. Please login or use a different email.', 'error');
                return;
            }

            const userId = 'user_' + Math.random().toString(36).substring(2, 11);

            const newUser = {
                userId,
                fullName,
                fatherName,
                mobile,
                email,
                password,
                collegeName,
                enrollmentNumber,
                branch,
                year
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            registrationForm.reset();
            showMessage('Registration successful! Please login.', 'success');
            window.location.href = 'login.html';
        });
        if (document.getElementById('show-login-link')) {
            document.getElementById('show-login-link').addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'login.html';
            });
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('loggedInUserEmail', email);
                localStorage.setItem('loggedInUserId', user.userId);
                if (loginError) loginError.classList.add('hidden');
                showMessage('Login successful!', 'success');
                window.location.href = 'library.html';
            } else {
                if (loginError) loginError.classList.remove('hidden');
                showMessage('Invalid email or password.', 'error');
            }
        });
        if (document.getElementById('show-register-link')) {
            document.getElementById('show-register-link').addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'register.html';
            });
        }
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', logoutUser);
    }

    checkLoginStatusAndRedirect();
});

function logoutUser() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedInUserEmail');
    localStorage.removeItem('loggedInUserId');
    showMessage('You have been logged out.', 'info');
    window.location.href = 'login.html';
}

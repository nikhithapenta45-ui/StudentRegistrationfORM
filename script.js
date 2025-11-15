/* ================================================================
   STUDENT REGISTRATION SYSTEM - JAVASCRIPT
   Task 6: JavaScript Functionality (40 Marks)
   ================================================================
   Features:
   1. Add new student records
   2. Edit existing records
   3. Delete records with confirmation
   4. Input validation (name, ID, email, contact)
   5. localStorage persistence (data survives page refresh)
   6. Dynamic scrollbar based on table height
   7. Form error messages
   ================================================================ */

// Wait for DOM to load before accessing elements
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Loaded - Initializing Student Registration System');

  // ================================================================
  // ELEMENT REFERENCES
  // ================================================================
  const form = document.getElementById('student-form');
  const nameInput = document.getElementById('name');
  const idInput = document.getElementById('studentId');
  const emailInput = document.getElementById('email');
  const contactInput = document.getElementById('contact');
  const submitBtn = document.getElementById('submit-btn');
  const resetBtn = document.getElementById('reset-btn');
  const studentsBody = document.getElementById('students-body');
  const tableWrapper = document.getElementById('table-wrapper');
  const emptyMessage = document.getElementById('empty-message');
  const studentCountDisplay = document.getElementById('student-count');

  // ================================================================
  // STATE VARIABLES
  // ================================================================
  let students = []; // Array to hold all student records
  let editingIndex = -1; // Index of student being edited (-1 = adding new)

  // ================================================================
  // VALIDATION FUNCTIONS
  // ================================================================

  /**
   * Validate student name - only letters and spaces allowed
   * @param {string} name - Student name to validate
   * @returns {boolean} - True if valid
   */
  function isValidName(name) {
    const nameRegex = /^[A-Za-z\s]+$/;
    return nameRegex.test(name) && name.trim().length >= 2;
  }

  /**
   * Validate student ID - only numbers allowed
   * @param {string} id - Student ID to validate
   * @returns {boolean} - True if valid
   */
  function isValidStudentId(id) {
    const idRegex = /^\d+$/;
    return idRegex.test(id) && id.trim().length > 0;
  }

  /**
   * Validate email address format
   * @param {string} email - Email to validate
   * @returns {boolean} - True if valid
   */
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate contact number - only numbers, minimum 10 digits
   * @param {string} contact - Contact number to validate
   * @returns {boolean} - True if valid
   */
  function isValidContact(contact) {
    const contactRegex = /^\d+$/;
    return contactRegex.test(contact) && contact.length >= 10;
  }

  /**
   * Show error message for a field
   * @param {HTMLElement} input - Input element
   * @param {string} message - Error message to display
   */
  function showError(input, message) {
    input.classList.add('error');
    const errorElement = document.getElementById(input.id + '-error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
    }
  }

  /**
   * Clear error message for a field
   * @param {HTMLElement} input - Input element
   */
  function clearError(input) {
    input.classList.remove('error');
    const errorElement = document.getElementById(input.id + '-error');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.remove('show');
    }
  }

  /**
   * Clear all field errors
   */
  function clearAllErrors() {
    [nameInput, idInput, emailInput, contactInput].forEach(input => {
      clearError(input);
    });
  }

  // ================================================================
  // LOCALSTORAGE FUNCTIONS
  // ================================================================

  /**
   * Save students array to localStorage
   * Ensures data persists across page refreshes
   */
  function saveToStorage() {
    try {
      localStorage.setItem('studentRecords', JSON.stringify(students));
      console.log('Data saved to localStorage');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      alert('Error saving data. Please try again.');
    }
  }

  /**
   * Load students from localStorage
   * Called on page load to restore saved records
   */
  function loadFromStorage() {
    try {
      const stored = localStorage.getItem('studentRecords');
      students = stored ? JSON.parse(stored) : [];
      console.log('Data loaded from localStorage:', students.length, 'records found');
      return students;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      students = [];
      return [];
    }
  }

  // ================================================================
  // RENDER FUNCTIONS
  // ================================================================

  /**
   * Render all student records in the table
   * Updates the display with current student data
   */
  function renderTable() {
    // Clear existing rows
    studentsBody.innerHTML = '';

    if (students.length === 0) {
      // Show empty message when no students
      emptyMessage.classList.add('show');
      tableWrapper.style.display = 'block';
      return;
    } else {
      // Hide empty message when students exist
      emptyMessage.classList.remove('show');
    }

    // Create rows for each student
    students.forEach((student, index) => {
      const row = document.createElement('tr');

      // Create name cell
      const nameCell = document.createElement('td');
      nameCell.setAttribute('data-label', 'Name');
      nameCell.textContent = student.name;

      // Create ID cell
      const idCell = document.createElement('td');
      idCell.setAttribute('data-label', 'Student ID');
      idCell.textContent = student.studentId;

      // Create email cell
      const emailCell = document.createElement('td');
      emailCell.setAttribute('data-label', 'Email');
      emailCell.textContent = student.email;

      // Create contact cell
      const contactCell = document.createElement('td');
      contactCell.setAttribute('data-label', 'Contact No.');
      contactCell.textContent = student.contact;

      // Create actions cell with Edit and Delete buttons
      const actionsCell = document.createElement('td');
      actionsCell.setAttribute('data-label', 'Actions');

      // Edit button
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.className = 'action-btn edit-btn';
      editBtn.type = 'button';
      editBtn.addEventListener('click', () => editStudent(index));

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.className = 'action-btn delete-btn';
      deleteBtn.type = 'button';
      deleteBtn.addEventListener('click', () => deleteStudent(index));

      // Append buttons to actions cell
      actionsCell.appendChild(editBtn);
      actionsCell.appendChild(deleteBtn);

      // Append all cells to row
      row.appendChild(nameCell);
      row.appendChild(idCell);
      row.appendChild(emailCell);
      row.appendChild(contactCell);
      row.appendChild(actionsCell);

      // Append row to table body
      studentsBody.appendChild(row);
    });

    // Update student count display
    updateStudentCount();

    // Manage dynamic scrollbar
    manageDynamicScrollbar();
  }

  /**
   * Update the total student count display
   */
  function updateStudentCount() {
    studentCountDisplay.textContent = students.length;
  }

  /**
   * Manage dynamic vertical scrollbar
   * Shows scrollbar only when table content exceeds wrapper height
   */
  function manageDynamicScrollbar() {
    if (!tableWrapper) return;

    // Check if content overflows
    if (tableWrapper.scrollHeight > tableWrapper.clientHeight) {
      tableWrapper.style.overflowY = 'scroll';
    } else {
      tableWrapper.style.overflowY = 'auto';
    }
  }

  // ================================================================
  // CRUD OPERATIONS
  // ================================================================

  /**
   * Add a new student record
   * @param {Object} student - Student object {name, studentId, email, contact}
   */
  function addStudent(student) {
    students.push(student);
    saveToStorage();
    renderTable();
    console.log('Student added:', student);
  }

  /**
   * Update an existing student record
   * @param {number} index - Index of student to update
   * @param {Object} student - Updated student object
   */
  function updateStudent(index, student) {
    if (index >= 0 && index < students.length) {
      students[index] = student;
      saveToStorage();
      renderTable();
      console.log('Student updated at index', index, student);
    }
  }

  /**
   * Delete a student record with confirmation
   * @param {number} index - Index of student to delete
   */
  function deleteStudent(index) {
    if (index < 0 || index >= students.length) return;

    // Confirm deletion
    const student = students[index];
    const confirmed = confirm(`Are you sure you want to delete ${student.name}?`);

    if (confirmed) {
      students.splice(index, 1);
      saveToStorage();
      renderTable();
      console.log('Student deleted at index', index);
    }
  }

  /**
   * Populate form with student data for editing
   * @param {number} index - Index of student to edit
   */
  function editStudent(index) {
    if (index < 0 || index >= students.length) return;

    const student = students[index];
    editingIndex = index;

    // Populate form fields
    nameInput.value = student.name;
    idInput.value = student.studentId;
    emailInput.value = student.email;
    contactInput.value = student.contact;

    // Update button text and style
    submitBtn.textContent = 'Update Student';
    submitBtn.classList.add('editing');

    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth' });
    nameInput.focus();

    console.log('Editing student at index', index);
  }

  /**
   * Reset form to initial state
   */
  function resetForm() {
    form.reset();
    editingIndex = -1;
    submitBtn.textContent = 'Add Student';
    submitBtn.classList.remove('editing');
    clearAllErrors();
    console.log('Form reset');
  }

  // ================================================================
  // FORM SUBMISSION HANDLER
  // ================================================================
  form.addEventListener('submit', function(event) {
    event.preventDefault();
    console.log('Form submitted');

    // Clear previous errors
    clearAllErrors();

    // Get form values and trim whitespace
    const name = nameInput.value.trim();
    const studentId = idInput.value.trim();
    const email = emailInput.value.trim();
    const contact = contactInput.value.trim();

    // Validation flags
    let isValid = true;

    // Validate name
    if (!name) {
      showError(nameInput, 'Student name is required');
      isValid = false;
    } else if (!isValidName(name)) {
      showError(nameInput, 'Name must contain only letters and spaces');
      isValid = false;
    }

    // Validate student ID
    if (!studentId) {
      showError(idInput, 'Student ID is required');
      isValid = false;
    } else if (!isValidStudentId(studentId)) {
      showError(idInput, 'Student ID must contain only numbers');
      isValid = false;
    }

    // Validate email
    if (!email) {
      showError(emailInput, 'Email is required');
      isValid = false;
    } else if (!isValidEmail(email)) {
      showError(emailInput, 'Please enter a valid email address');
      isValid = false;
    }

    // Validate contact number
    if (!contact) {
      showError(contactInput, 'Contact number is required');
      isValid = false;
    } else if (!isValidContact(contact)) {
      showError(contactInput, 'Contact must be 10+ digits');
      isValid = false;
    }

    // If validation fails, stop submission
    if (!isValid) {
      console.log('Form validation failed');
      return;
    }

    // Create student object
    const student = {
      name: name,
      studentId: studentId,
      email: email,
      contact: contact
    };

    // Add or update student
    if (editingIndex >= 0) {
      updateStudent(editingIndex, student);
      alert(`Student "${name}" updated successfully!`);
    } else {
      addStudent(student);
      alert(`Student "${name}" added successfully!`);
    }

    // Reset form after submission
    resetForm();
  });

  // ================================================================
  // RESET BUTTON HANDLER
  // ================================================================
  resetBtn.addEventListener('click', resetForm);

  // ================================================================
  // INPUT EVENT LISTENERS FOR REAL-TIME FEEDBACK
  // ================================================================
  nameInput.addEventListener('blur', function() {
    if (this.value.trim() && !isValidName(this.value.trim())) {
      showError(this, 'Name must contain only letters and spaces');
    } else {
      clearError(this);
    }
  });

  idInput.addEventListener('blur', function() {
    if (this.value.trim() && !isValidStudentId(this.value.trim())) {
      showError(this, 'Student ID must contain only numbers');
    } else {
      clearError(this);
    }
  });

  emailInput.addEventListener('blur', function() {
    if (this.value.trim() && !isValidEmail(this.value.trim())) {
      showError(this, 'Please enter a valid email address');
    } else {
      clearError(this);
    }
  });

  contactInput.addEventListener('blur', function() {
    if (this.value.trim() && !isValidContact(this.value.trim())) {
      showError(this, 'Contact must be 10+ digits');
    } else {
      clearError(this);
    }
  });

  // ================================================================
  // INITIALIZATION
  // ================================================================
  // Load data from storage on page load
  loadFromStorage();

  // Initial render
  renderTable();

  console.log('Student Registration System initialized successfully');
});

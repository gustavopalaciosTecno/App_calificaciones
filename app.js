class GradesAttendanceApp {
    constructor() {
        this.students = JSON.parse(localStorage.getItem('students')) || [];
        this.grades = JSON.parse(localStorage.getItem('grades')) || {};
        this.attendance = JSON.parse(localStorage.getItem('attendance')) || {};
        this.currentDate = new Date();
        this.selectedStudent = null;
        
        this.init();
    }
    
    init() {
        this.setupTabs();
        this.setupStudentForm();
        this.setupGrades();
        this.setupAttendance();
        this.renderStudents();
        this.updateStudentSelects();
    }
    
    setupTabs() {
        const tabButtons = document.querySelectorAll('.nav-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }
    
    setupStudentForm() {
        const addStudentBtn = document.getElementById('addStudentBtn');
        const studentForm = document.getElementById('studentForm');
        const addStudentForm = document.getElementById('addStudentForm');
        const cancelBtn = document.getElementById('cancelBtn');
        
        addStudentBtn.addEventListener('click', () => {
            studentForm.style.display = 'block';
            addStudentBtn.style.display = 'none';
        });
        
        cancelBtn.addEventListener('click', () => {
            studentForm.style.display = 'none';
            addStudentBtn.style.display = 'block';
            addStudentForm.reset();
        });
        
        addStudentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addStudent();
        });
    }
    
    addStudent() {
        const name = document.getElementById('studentName').value.trim();
        const id = document.getElementById('studentId').value.trim();
        
        if (!name || !id) return;
        
        // Check if student ID already exists
        if (this.students.find(student => student.id === id)) {
            alert('Ya existe un estudiante con este ID');
            return;
        }
        
        const student = {
            id: id,
            name: name,
            createdAt: new Date().toISOString()
        };
        
        this.students.push(student);
        this.saveStudents();
        this.renderStudents();
        this.updateStudentSelects();
        
        // Reset form
        document.getElementById('addStudentForm').reset();
        document.getElementById('studentForm').style.display = 'none';
        document.getElementById('addStudentBtn').style.display = 'block';
    }
    
    renderStudents() {
        const studentsList = document.getElementById('studentsList');
        
        if (this.students.length === 0) {
            studentsList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No hay estudiantes registrados</p>';
            return;
        }
        
        studentsList.innerHTML = this.students.map(student => `
            <div class="student-item">
                <div class="student-info">
                    <h4>${student.name}</h4>
                    <p>ID: ${student.id}</p>
                </div>
                <button class="btn-secondary" onclick="app.deleteStudent('${student.id}')">Eliminar</button>
            </div>
        `).join('');
    }
    
    deleteStudent(studentId) {
        if (confirm('¿Estás seguro de que quieres eliminar este estudiante? Se perderán todas sus calificaciones y asistencia.')) {
            this.students = this.students.filter(student => student.id !== studentId);
            delete this.grades[studentId];
            delete this.attendance[studentId];
            
            this.saveStudents();
            this.saveGrades();
            this.saveAttendance();
            
            this.renderStudents();
            this.updateStudentSelects();
        }
    }
    
    updateStudentSelects() {
        const selects = [
            document.getElementById('studentSelect'),
            document.getElementById('studentSelectAttendance')
        ];
        
        selects.forEach(select => {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Seleccionar estudiante...</option>';
            
            this.students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.id;
                option.textContent = `${student.name} (${student.id})`;
                select.appendChild(option);
            });
            
            select.value = currentValue;
        });
    }
    
    setupGrades() {
        const studentSelect = document.getElementById('studentSelect');
        const saveGradesBtn = document.getElementById('saveGradesBtn');
        
        studentSelect.addEventListener('change', () => {
            this.loadStudentGrades(studentSelect.value);
        });
        
        saveGradesBtn.addEventListener('click', () => {
            this.saveStudentGrades();
        });
    }
    
    loadStudentGrades(studentId) {
        if (!studentId) {
            document.getElementById('selectedStudentName').textContent = 'Selecciona un estudiante';
            this.clearGradeInputs();
            return;
        }
        
        const student = this.students.find(s => s.id === studentId);
        if (!student) return;
        
        document.getElementById('selectedStudentName').textContent = student.name;
        
        const studentGrades = this.grades[studentId] || {};
        const gradeInputs = document.querySelectorAll('.grade-input');
        
        gradeInputs.forEach(input => {
            const period = input.getAttribute('data-period');
            input.value = studentGrades[period] || '';
        });
        
        this.selectedStudent = studentId;
    }
    
    clearGradeInputs() {
        const gradeInputs = document.querySelectorAll('.grade-input');
        gradeInputs.forEach(input => {
            input.value = '';
        });
        this.selectedStudent = null;
    }
    
    saveStudentGrades() {
        if (!this.selectedStudent) {
            alert('Selecciona un estudiante primero');
            return;
        }
        
        const gradeInputs = document.querySelectorAll('.grade-input');
        const studentGrades = {};
        
        gradeInputs.forEach(input => {
            const period = input.getAttribute('data-period');
            const value = parseFloat(input.value);
            
            if (!isNaN(value) && value >= 1 && value <= 10) {
                studentGrades[period] = value;
            }
        });
        
        this.grades[this.selectedStudent] = studentGrades;
        this.saveGrades();
        
        alert('Calificaciones guardadas correctamente');
    }
    
    setupAttendance() {
        const studentSelectAttendance = document.getElementById('studentSelectAttendance');
        const prevMonthBtn = document.getElementById('prevMonth');
        const nextMonthBtn = document.getElementById('nextMonth');
        
        studentSelectAttendance.addEventListener('change', () => {
            this.selectedStudent = studentSelectAttendance.value;
            this.renderCalendar();
        });
        
        prevMonthBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });
        
        nextMonthBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });
        
        this.renderCalendar();
    }
    
    renderCalendar() {
        const calendar = document.getElementById('calendar');
        const currentMonth = document.getElementById('currentMonth');
        
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        
        currentMonth.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        
        // Clear calendar
        calendar.innerHTML = '';
        
        // Add day headers
        dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.classList.add('calendar-header');
            dayHeader.textContent = day;
            calendar.appendChild(dayHeader);
        });
        
        // Get first day of the month and number of days
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        // Add calendar days
        for (let i = 0; i < 42; i++) {
            const cellDate = new Date(startDate);
            cellDate.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            dayElement.textContent = cellDate.getDate();
            
            const dateKey = this.formatDate(cellDate);
            const isCurrentMonth = cellDate.getMonth() === this.currentDate.getMonth();
            const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6;
            const isFuture = cellDate > new Date();
            
            if (!isCurrentMonth) {
                dayElement.classList.add('other-month');
            } else if (isWeekend) {
                dayElement.classList.add('weekend');
            } else if (!isFuture && this.selectedStudent) {
                // Add click event for weekdays in current month
                dayElement.addEventListener('click', () => {
                    this.toggleAttendance(this.selectedStudent, dateKey, dayElement);
                });
                
                // Check attendance status
                const studentAttendance = this.attendance[this.selectedStudent] || {};
                const status = studentAttendance[dateKey];
                
                if (status === 'present') {
                    dayElement.classList.add('present');
                } else if (status === 'absent') {
                    dayElement.classList.add('absent');
                }
            }
            
            calendar.appendChild(dayElement);
        }
    }
    
    toggleAttendance(studentId, dateKey, dayElement) {
        if (!this.attendance[studentId]) {
            this.attendance[studentId] = {};
        }
        
        const currentStatus = this.attendance[studentId][dateKey];
        
        // Remove existing classes
        dayElement.classList.remove('present', 'absent');
        
        // Cycle through: none -> present -> absent -> none
        if (!currentStatus) {
            this.attendance[studentId][dateKey] = 'present';
            dayElement.classList.add('present');
        } else if (currentStatus === 'present') {
            this.attendance[studentId][dateKey] = 'absent';
            dayElement.classList.add('absent');
        } else {
            delete this.attendance[studentId][dateKey];
        }
        
        this.saveAttendance();
    }
    
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
    
    saveStudents() {
        localStorage.setItem('students', JSON.stringify(this.students));
    }
    
    saveGrades() {
        localStorage.setItem('grades', JSON.stringify(this.grades));
    }
    
    saveAttendance() {
        localStorage.setItem('attendance', JSON.stringify(this.attendance));
    }
}

// Initialize the app
const app = new GradesAttendanceApp();


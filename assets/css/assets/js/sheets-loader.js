// Google Sheets Data Loader
class SheetsLoader {
    constructor() {
        this.courses = [];
        this.lessons = [];
        this.initialized = false;
    }

    // Initialize Tabletop with Google Sheets
    init() {
        // Replace with your Google Sheets ID
        const spreadsheetId = 'SPREADSHEET_ID';
        const publicSheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?usp=sharing`;
        
        Tabletop.init({
            key: publicSheetUrl,
            callback: (data, tabletop) => this.processData(data, tabletop),
            simpleSheet: false,
            wanted: ['courses', 'lessons']
        });
    }

    // Process the data from Google Sheets
    processData(data, tabletop) {
        if (data.courses && data.courses.elements) {
            this.courses = data.courses.elements;
        }
        
        if (data.lessons && data.lessons.elements) {
            this.lessons = data.lessons.elements;
        }
        
        this.initialized = true;
        
        // Dispatch custom event when data is loaded
        const event = new CustomEvent('sheetsLoaded', {
            detail: {
                courses: this.courses,
                lessons: this.lessons
            }
        });
        document.dispatchEvent(event);
    }

    // Get all courses
    getCourses() {
        return this.courses;
    }

    // Get courses with filtering options
    getFilteredCourses(searchTerm = '', category = '', priceFilter = '') {
        return this.courses.filter(course => {
            const matchesSearch = !searchTerm || 
                course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.description.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesCategory = !category || course.category === category;
            
            const matchesPrice = !priceFilter || 
                (priceFilter === 'free' && course.price === '0') ||
                (priceFilter === 'paid' && course.price !== '0');
            
            return matchesSearch && matchesCategory && matchesPrice;
        });
    }

    // Get course by slug
    getCourseBySlug(slug) {
        return this.courses.find(course => course.slug === slug);
    }

    // Get lessons for a course
    getLessonsForCourse(courseId) {
        return this.lessons
            .filter(lesson => lesson.course_id === courseId)
            .sort((a, b) => parseInt(a.order) - parseInt(b.order));
    }

    // Get all unique categories
    getCategories() {
        const categories = [...new Set(this.courses.map(course => course.category))];
        return categories.filter(category => category); // Remove empty categories
    }
}

// Create global instance
const sheetsLoader = new SheetsLoader();

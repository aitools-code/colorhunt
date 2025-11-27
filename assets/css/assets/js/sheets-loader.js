// Google Sheets data loader using Tabletop.js
class SheetsLoader {
    constructor(spreadsheetKey) {
        this.spreadsheetKey = spreadsheetKey;
        this.courses = [];
        this.lessons = [];
        this.isLoaded = false;
        this.loadCallbacks = [];
    }
    
    // Initialize Tabletop and load data
    init() {
        return new Promise((resolve, reject) => {
            if (this.isLoaded) {
                resolve({ courses: this.courses, lessons: this.lessons });
                return;
            }
            
            // Add to load callbacks
            this.loadCallbacks.push({ resolve, reject });
            
            // Only initialize Tabletop once
            if (this.loadCallbacks.length === 1) {
                Tabletop.init({
                    key: this.spreadsheetKey,
                    callback: (data, tabletop) => {
                        this.processData(data);
                        this.isLoaded = true;
                        
                        // Resolve all pending promises
                        this.loadCallbacks.forEach(callback => {
                            callback.resolve({ courses: this.courses, lessons: this.lessons });
                        });
                        this.loadCallbacks = [];
                    },
                    simpleSheet: false,
                    wanted: ['courses', 'lessons']
                });
            }
        });
    }
    
    // Process the data from Google Sheets
    processData(data) {
        // Process courses
        if (data.courses && data.courses.elements) {
            this.courses = data.courses.elements.map(course => ({
                course_id: course.course_id,
                title: course.title,
                slug: course.slug,
                description: course.description,
                thumbnail_url: course.thumbnail_url,
                price: parseFloat(course.price) || 0,
                category: course.category
            }));
        }
        
        // Process lessons
        if (data.lessons && data.lessons.elements) {
            this.lessons = data.lessons.elements.map(lesson => ({
                lesson_id: lesson.lesson_id,
                course_id: lesson.course_id,
                title: lesson.title,
                content_url: lesson.content_url,
                order: parseInt(lesson.order) || 0
            })).sort((a, b) => a.order - b.order);
        }
    }
    
    // Get all courses
    getCourses() {
        return this.courses;
    }
    
    // Get a specific course by slug
    getCourseBySlug(slug) {
        return this.courses.find(course => course.slug === slug);
    }
    
    // Get lessons for a specific course
    getLessonsForCourse(courseId) {
        return this.lessons.filter(lesson => lesson.course_id === courseId);
    }
    
    // Search courses by title and category
    searchCourses(query, category) {
        let results = this.courses;
        
        // Filter by search query
        if (query) {
            const lowercaseQuery = query.toLowerCase();
            results = results.filter(course => 
                course.title.toLowerCase().includes(lowercaseQuery) ||
                course.description.toLowerCase().includes(lowercaseQuery)
            );
        }
        
        // Filter by category
        if (category) {
            results = results.filter(course => course.category === category);
        }
        
        return results;
    }
    
    // Get all unique categories
    getCategories() {
        const categories = this.courses.map(course => course.category);
        return [...new Set(categories)].filter(Boolean).sort();
    }
}

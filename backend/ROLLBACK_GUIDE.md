# Performance Optimization Rollback Guide

If you encounter any issues with the performance optimizations, follow this guide to safely rollback changes.

## 🚨 Quick Rollback Steps

### 1. Rollback Database Indexes (if causing issues)
```bash
php artisan migrate:rollback --step=1
```

### 2. Disable Caching (temporary fix)
Add to your `.env`:
```env
CACHE_DRIVER=array
```

### 3. Revert Controller Changes

#### ReportController - Revert to Original
```php
// Replace the optimized students() method with:
public function students(Request $request): JsonResponse
{
    $query = Student::with(['affiliations', 'violations', 'academicRecords.grades', 'skills', 'nonAcademicHistories']);

    if ($request->filled('status')) $query->where('status', $request->status);
    if ($request->filled('gender')) $query->where('gender', $request->gender);
    if ($request->filled('department')) $query->where('department', $request->department);

    if ($request->filled('skill')) {
        $skill = $request->skill;
        $query->whereHas('skills', fn($q) => $q->where('skill_name', 'like', "%$skill%"));
    }
    // ... (continue with original whereHas patterns)

    $students = $query->orderBy('last_name')->get();
    return response()->json(['count' => $students->count(), 'students' => $students]);
}
```

#### StudentController - Revert to Original
```php
public function index(Request $request): JsonResponse
{
    $with = ['academicRecords'];
    if ($request->boolean('with_details')) {
        $with = ['violations', 'affiliations', 'academicRecords.grades', 'skills', 'nonAcademicHistories'];
    }

    $query = Student::with($with);
    // ... (original filtering logic)

    if ($request->filled('per_page')) {
        $perPage = min((int) $request->input('per_page'), 200);
        return response()->json($query->orderBy('last_name')->paginate($perPage));
    }

    return response()->json($query->orderBy('last_name')->get());
}

public function show(Student $student): JsonResponse
{
    return response()->json($student->load(['violations', 'affiliations', 'academicRecords.grades.subject', 'skills', 'nonAcademicHistories']));
}
```

## 🔍 Common Issues & Solutions

### Issue 1: "Class 'App\Services\CacheService' not found"
**Solution:**
```bash
composer dump-autoload
```

### Issue 2: Database errors with indexes
**Solution:**
```bash
php artisan migrate:rollback --step=1
php artisan migrate:status
```

### Issue 3: API responses changed format
**Problem:** Frontend expecting `{count, students}` but getting paginated format.

**Quick Fix:** Add this to ReportController:
```php
// Always return original format
return response()->json([
    'count' => $students->total(),
    'students' => $students->items()
]);
```

### Issue 4: Slow queries still occurring
**Solution:**
1. Check if indexes were created:
```sql
SHOW INDEX FROM students;
SHOW INDEX FROM skills;
```

2. If missing, run:
```bash
php artisan migrate
```

### Issue 5: Cache-related errors
**Temporary fix:**
```bash
php artisan cache:clear
php artisan config:clear
```

**Permanent fix (disable caching):**
```php
// In AppServiceProvider.php, comment out:
// $this->setupQueryCaching();
```

## 📋 Validation Checklist

Before considering rollback complete, verify:

- [ ] All API endpoints return expected data format
- [ ] No database errors in logs
- [ ] Frontend can load student lists
- [ ] Search functionality works
- [ ] Faculty evaluation summaries load
- [ ] Academic record creation works

## 🛠 Step-by-Step Rollback Process

### Step 1: Backup Current State
```bash
# Backup database
mysqldump -u username -p database_name > backup_optimized.sql

# Backup optimized files
cp -r app/Http/Controllers/Api app/Http/Controllers/Api_optimized_backup
cp -r app/Services app/Services_backup
```

### Step 2: Revert Files
```bash
# Remove optimization files
rm app/Services/CacheService.php
rm app/Services/PerformanceService.php
rm app/Http/Middleware/CacheResponse.php
rm app/Console/Commands/ValidateOptimizations.php

# Restore original controller methods (manual edit required)
```

### Step 3: Revert Database
```bash
php artisan migrate:rollback --step=1
```

### Step 4: Clear Caches
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### Step 5: Test Functionality
```bash
# Run validation
php artisan optimize:validate

# Or test manually:
curl -X GET "http://your-app.com/api/students"
curl -X GET "http://your-app.com/api/reports/students"
```

## 🔄 Partial Rollback Options

### Keep Database Indexes (Recommended)
The database indexes are safe and provide performance benefits without changing API behavior:
```bash
# Keep the indexes, they don't break anything
# Only rollback application code if needed
```

### Keep Caching, Rollback Queries
```bash
# Keep CacheService for dashboard/presets
# Revert only the complex query optimizations in controllers
```

### Keep Pagination, Rollback Filtering
```bash
# Keep pagination improvements
# Revert whereExists back to whereHas if causing issues
```

## 📞 Emergency Contacts

If you need immediate help:

1. **Check Laravel logs:** `storage/logs/laravel.log`
2. **Check database logs:** MySQL slow query log
3. **Test with Postman/curl:** Verify API responses
4. **Monitor performance:** Check response times

## 🎯 Prevention for Future

1. **Always test in staging first**
2. **Use feature flags for major changes**
3. **Monitor query performance after deployment**
4. **Keep rollback scripts ready**
5. **Document all changes thoroughly**

---

**Remember:** The optimizations are designed to be backward compatible, but if issues arise, this guide will help you safely revert to the working state.
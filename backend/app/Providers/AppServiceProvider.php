<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\Model;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Enable query caching for frequently accessed static data
        $this->setupQueryCaching();
        
        // Optimize Eloquent performance
        Model::preventLazyLoading(!app()->isProduction());
        Model::preventSilentlyDiscardingAttributes(!app()->isProduction());
    }

    /**
     * Setup caching for frequently accessed data
     */
    private function setupQueryCaching(): void
    {
        // Skip caching during migrations or if tables don't exist yet
        if (app()->runningInConsole() && (app()->runningUnitTests() || $this->isMigrating())) {
            return;
        }

        try {
            // Cache department list (rarely changes)
            Cache::remember('departments_list', 3600, function () {
                return \App\Models\Department::select('id', 'name', 'code')->get();
            });

            // Cache subject curriculum (changes per semester)
            Cache::remember('subjects_by_program', 1800, function () {
                return \App\Models\Subject::select('id', 'subject_name', 'year_level', 'semester', 'program', 'units')
                    ->get()
                    ->groupBy(['program', 'year_level', 'semester']);
            });

            // Cache faculty list for dropdowns
            Cache::remember('faculty_list', 1800, function () {
                return \App\Models\Faculty::select('id', 'faculty_id', 'first_name', 'last_name', 'department')
                    ->orderBy('last_name')
                    ->get();
            });
        } catch (\Exception $e) {
            // Silently fail during migrations or when tables don't exist
            // This prevents deployment failures when database isn't ready
        }
    }

    /**
     * Check if we're currently running migrations
     */
    private function isMigrating(): bool
    {
        return in_array('migrate', $_SERVER['argv'] ?? []) || 
               in_array('migrate:fresh', $_SERVER['argv'] ?? []) ||
               in_array('migrate:refresh', $_SERVER['argv'] ?? []);
    }
}

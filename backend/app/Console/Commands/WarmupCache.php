<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\PerformanceOptimizer;
use App\Services\CacheService;

class WarmupCache extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'cache:warmup';

    /**
     * The console command description.
     */
    protected $description = 'Warm up application caches for better performance';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Warming up application caches...');

        try {
            // Warm up performance optimizer caches
            PerformanceOptimizer::warmupCache();
            $this->info('✓ Performance caches warmed up');

            // Warm up service caches
            CacheService::getDepartments();
            CacheService::getFacultyList();
            CacheService::getSubjectsByProgram();
            $this->info('✓ Service caches warmed up');

            // Warm up dashboard data
            PerformanceOptimizer::getDashboardStats();
            $this->info('✓ Dashboard caches warmed up');

            $this->info('Cache warmup completed successfully!');
            return 0;

        } catch (\Exception $e) {
            $this->error('Cache warmup failed: ' . $e->getMessage());
            return 1;
        }
    }
}
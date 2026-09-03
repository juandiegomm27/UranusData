<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(append: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
    })

    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);

        $middleware->trustProxies(at: ['127.0.0.1', '10.0.0.0/8']);

        $middleware->statefulApi();
    })

    ->withMiddleware(function (Middleware $middleware) {
        $middleware->statefulApi();
        
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);
    })

    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
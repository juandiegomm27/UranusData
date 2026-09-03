<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Sanctum Stateful Domains
    |--------------------------------------------------------------------------
    |
    | Requests from the following domains / hosts will receive stateful API
    | authentication cookies. Your frontend URL should be included.
    |
    */
    'stateful' => explode(',', env(
        'SANCTUM_STATEFUL_DOMAINS',
        'localhost,localhost:4200,localhost:3000,127.0.0.1,127.0.0.1:8000'
    )),

    /*
    |--------------------------------------------------------------------------
    | Sanctum Guards
    |--------------------------------------------------------------------------
    |
    | This array contains the authentication guards that will be checked when
    | Sanctum is trying to authenticate a request.
    |
    */
    'guard' => ['web'],

    /*
    |--------------------------------------------------------------------------
    | Expiration Minutes
    |--------------------------------------------------------------------------
    |
    | This value controls how long API tokens issued by Sanctum will be valid.
    | If this value is null, personal access tokens will never expire.
    |
    */
    'expiration' => null,  // Sin expiración, o usar: 60 * 24 * 365 para 1 año

    /*
    |--------------------------------------------------------------------------
    | Token Prefix
    |--------------------------------------------------------------------------
    |
    | Sanctum can prefix new tokens with a given value to help identify them
    | when using tools like Laravel Telescope. Set the value to an empty
    | string in case you do not want any prefix to be added.
    |
    */
    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

];
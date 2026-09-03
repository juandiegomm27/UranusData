<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthTest extends TestCase
{
    public function test_health_endpoint_returns_ok(): void
    {
        $response = $this->get('/health');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'ok',
            ]);
    }
}

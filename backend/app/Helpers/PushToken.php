<?php

use Illuminate\Support\Facades\Http;

function sendExpoPush($token, $title, $body, $data = [])
{
    Http::post('https://exp.host/--/api/v2/push/send', [
        'to' => $token,
        'sound' => 'default',
        'title' => $title,
        'body' => $body,
        'data' => $data,
    ]);
}


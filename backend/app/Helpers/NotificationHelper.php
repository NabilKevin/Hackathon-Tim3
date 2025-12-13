<?php

use App\Models\Notification;

function createNotification($user_id, $vehicle_id, $title, $content, $type)
{
  return Notification::create([
    'user_id' => $user_id,
    'vehicle_id' => $vehicle_id,
    'title' => $title,
    'content' => $content,
    'type' => $type,
  ]);
}
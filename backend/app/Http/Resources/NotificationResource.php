<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'message' => $this->excerpt ?? $this->content,
            'type' => $this->type, // ⬅️ PENTING
            'is_read' => $this->is_read,
            'created_at' => $this->created_at?->diffForHumans(),
        ];
    }
}

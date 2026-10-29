<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $this->resource;

        return match ($user->role) {
            'psychologist' => $this->psychologistProfile($user),
            'mentor' => $this->mentorProfile($user),
            'parent' => $this->parentProfile($user),
            'child' => $this->childProfile($user),
            default => [],
        };
    }

    private function psychologistProfile($user): array
    {
        $p = $user->psychologist;

        return [
            'external_id' => $p ? (string) $p->id : null,
        ];
    }

    private function mentorProfile($user): array
    {
        $m = $user->mentor;

        if (! $m) {
            return [];
        }

        return [
            'external_id' => $m->psychologist_id.'.'.$m->id,
            'organization' => $m->organization,
            'psychologist_id' => $m->psychologist_id,
        ];
    }

    private function parentProfile($user): array
    {
        $p = $user->parent;

        if (! $p) {
            return [];
        }

        $mentor = $p->mentor;

        return [
            'external_id' => $mentor->psychologist_id.'.'.$mentor->id.'.'.$p->id,
            'psychologist_id' => $p->psychologist_id,
            'mentor_id' => $p->mentor_id,
        ];
    }

    private function childProfile($user): array
    {
        $c = $user->child;

        if (! $c) {
            return [];
        }

        $parent = $c->parent;
        $mentor = $c->mentor;

        return [
            'external_id' => $mentor->psychologist_id.'.'.$mentor->id.'.'.$parent->id.'.'.$c->id,
            'psychologist_id' => $c->psychologist_id,
            'mentor_id' => $c->mentor_id,
            'parent_id' => $c->parent_id,
        ];
    }
}
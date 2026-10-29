<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Child;
use App\Models\Mentor;
use App\Models\ParentModel;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class PsychologistUserController extends Controller
{
    public function index(Request $request)
    {
        $psychologist = $request->user()->psychologist;
        if (!$psychologist) return response()->json(['message' => 'Профиль не найден'], 403);

        return response()->json([
            'data' => $this->buildUsersData($psychologist)
        ]);
    }

    public function export(Request $request)
    {
        $psychologist = $request->user()->psychologist;
        if (!$psychologist) return response()->json(['message' => 'Профиль не найден'], 403);

        $type = $request->query('type', 'all');
        if (!in_array($type, ['all', 'mentors', 'parents', 'children'], true)) {
            return response()->json(['message' => 'Неверный тип выгрузки'], 422);
        }

        $data = $this->buildUsersData($psychologist);

        $categories = [];
        if ($type === 'all' || $type === 'mentors')   $categories['Наставники'] = $data['mentors'];
        if ($type === 'all' || $type === 'parents')   $categories['Родители']   = $data['parents'];
        if ($type === 'all' || $type === 'children')  $categories['Дети']       = $data['children'];

        $total = array_sum(array_map('count', $categories));
        if ($total === 0) {
            return response()->json(['message' => 'Нет пользователей для выгрузки'], 404);
        }

        $titles = [
            'all'      => 'Все пользователи',
            'mentors'  => 'Наставники',
            'parents'  => 'Родители',
            'children' => 'Дети',
        ];

        $pdf = Pdf::loadView('pdf.users-export', [
            'categories' => $categories,
            'type'       => $type,
            'title'      => $titles[$type],
            'generatedAt'=> now()->format('d.m.Y H:i'),
        ])->setPaper('a4', 'portrait');

        $fileName = 'users-' . $type . '-' . now()->format('Y-m-d_His') . '.pdf';

        return $pdf->download($fileName);
    }

    public function store(Request $request)
    {
        $psychologist = $request->user()->psychologist;
        if (!$psychologist) return response()->json(['message' => 'Профиль не найден'], 403);

        $role = $request->input('role');

        $rules = [
            'role' => ['required', Rule::in(['mentor', 'parent', 'child'])],
            'name' => ['required', 'string', 'max:255'],
            'login' => ['required', 'string', 'max:255', 'unique:users,login'],
            'password' => ['required', 'string', 'min:6'],
        ];

        if ($role === 'mentor') {
            $rules['organization'] = ['required', 'string', 'max:255'];
        } elseif ($role === 'parent') {
            $rules['mentor_id'] = ['required', 'exists:mentors,id'];
        } elseif ($role === 'child') {
            $rules['mentor_id'] = ['required', 'exists:mentors,id'];
            $rules['parent_id'] = ['required', 'exists:parents,id'];
        }

        $validated = $request->validate($rules);

        $user = User::create([
            'name' => $validated['name'],
            'login' => $validated['login'],
            'password' => $validated['password'],
            'role' => $role,
        ]);

        if ($role === 'mentor') {
            Mentor::create([
                'user_id' => $user->id,
                'psychologist_id' => $psychologist->id,
                'organization' => $validated['organization'],
            ]);
        } elseif ($role === 'parent') {
            $mentor = Mentor::findOrFail($validated['mentor_id']);
            ParentModel::create([
                'user_id' => $user->id,
                'psychologist_id' => $psychologist->id,
                'mentor_id' => $mentor->id,
            ]);
        } elseif ($role === 'child') {
            Child::create([
                'user_id' => $user->id,
                'psychologist_id' => $psychologist->id,
                'mentor_id' => $validated['mentor_id'],
                'parent_id' => $validated['parent_id'],
            ]);
        }

        return response()->json(['message' => 'Пользователь создан'], 201);
    }

    public function update(Request $request, $id)
    {
        $psychologist = $request->user()->psychologist;
        $role = $request->input('role');

        $profile = match($role) {
            'mentor' => Mentor::where('psychologist_id', $psychologist->id)->findOrFail($id),
            'parent' => ParentModel::where('psychologist_id', $psychologist->id)->findOrFail($id),
            'child' => Child::where('psychologist_id', $psychologist->id)->findOrFail($id),
        };

        $user = $profile->user;

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'login' => ['required', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
        ];

        $newPassword = null;

        if ($request->input('generate_password')) {
            $newPassword = Str::password(8, symbols: false);
            $request->merge(['password' => $newPassword]);
        } else {
            if ($role === 'mentor') $rules['organization'] = ['required', 'string', 'max:255'];
            if ($role === 'parent') $rules['mentor_id'] = ['required', 'exists:mentors,id'];
            if ($role === 'child') {
                $rules['mentor_id'] = ['required', 'exists:mentors,id'];
                $rules['parent_id'] = ['required', 'exists:parents,id'];
            }
        }

        if ($request->filled('password')) {
            $rules['password'] = ['string', 'min:6'];
        }

        $validated = $request->validate($rules);

        $userData = ['name' => $validated['name'], 'login' => $validated['login']];
        if ($request->filled('password')) $userData['password'] = $validated['password'];
        $user->update($userData);

        if (!$request->input('generate_password')) {
            if ($role === 'mentor') {
                $profile->update(['organization' => $validated['organization']]);
            } elseif ($role === 'parent') {
                $profile->update(['mentor_id' => $validated['mentor_id']]);
            } elseif ($role === 'child') {
                $profile->update([
                    'parent_id' => $validated['parent_id'],
                    'mentor_id' => $validated['mentor_id']
                ]);
            }
        }

        return response()->json([
            'message' => 'Данные обновлены',
            'generated_password' => $newPassword
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $psychologist = $request->user()->psychologist;
        $role = $request->input('role');

        $profile = match($role) {
            'mentor' => Mentor::where('psychologist_id', $psychologist->id)->findOrFail($id),
            'parent' => ParentModel::where('psychologist_id', $psychologist->id)->findOrFail($id),
            'child' => Child::where('psychologist_id', $psychologist->id)->findOrFail($id),
        };

        $profile->user->delete();
        return response()->json(['message' => 'Пользователь удален']);
    }

    /**
     * Собирает данные пользователей психолога (наставники, родители, дети).
     * Используется и в index(), и в export(), чтобы не дублировать маппинг.
     */
    private function buildUsersData($psychologist): array
    {
        $mentors = Mentor::with('user')->where('psychologist_id', $psychologist->id)->get()->map(function ($m) {
            return [
                'id' => $m->id,
                'user_id' => $m->user_id,
                'number' => $m->psychologist_id . '.' . $m->id,
                'name' => $m->user->name,
                'login' => $m->user->login,
                'organization' => $m->organization,
                'role' => 'mentor'
            ];
        });

        $parents = ParentModel::with('user', 'mentor.user')->where('psychologist_id', $psychologist->id)->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'user_id' => $p->user_id,
                'number' => $p->mentor->psychologist_id . '.' . $p->mentor_id . '.' . $p->id,
                'name' => $p->user->name,
                'login' => $p->user->login,
                'mentor_name' => $p->mentor->user->name ?? '—',
                'mentor_id' => $p->mentor_id,
                'role' => 'parent'
            ];
        });

        $children = Child::with('user', 'parent.user', 'mentor.user')->where('psychologist_id', $psychologist->id)->get()->map(function ($c) {
            return [
                'id' => $c->id,
                'user_id' => $c->user_id,
                'number' => $c->mentor->psychologist_id . '.' . $c->mentor_id . '.' . $c->parent_id . '.' . $c->id,
                'name' => $c->user->name,
                'login' => $c->user->login,
                'parent_name' => $c->parent->user->name ?? '—',
                'mentor_name' => $c->mentor->user->name ?? '—',
                'parent_id' => $c->parent_id,
                'mentor_id' => $c->mentor_id,
                'role' => 'child'
            ];
        });

        return [
            'mentors' => $mentors,
            'parents' => $parents,
            'children' => $children,
        ];
    }
}
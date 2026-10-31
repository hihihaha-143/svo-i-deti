import client from './client';

export interface MentorTestResult {
  id: number;
  child: { id: number; name: string; login: string };
  test: { id: number; title: string };
  completed_at: string | null;
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export async function fetchMentorTestResults(params: {
  child_id?: number;
  test_id?: number;
  page?: number;
}) {
  const { data } = await client.get<Paginated<MentorTestResult>>(
    '/mentor/test-results',
    { params },
  );
  return data;
}

export async function fetchMentorChildren() {
  const { data } = await client.get('/mentor/children');
  return data.data ?? data;
}

export async function fetchTests() {
  const { data } = await client.get('/psychologist/tests');
  return data.data ?? data;
}
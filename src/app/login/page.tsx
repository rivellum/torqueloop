import { redirect } from 'next/navigation'
import { getUser, getSafeRedirectPath } from '@/lib/auth'
import LoginForm from './login-form'

type SearchParams = Record<string, string | string[] | undefined>

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>
}) {
  const params = searchParams ? await searchParams : {}
  const next = getSafeRedirectPath(firstParam(params.next), '/dashboard')
  const user = await getUser({ logErrors: false })

  if (user) {
    redirect(next)
  }

  return <LoginForm next={next} />
}

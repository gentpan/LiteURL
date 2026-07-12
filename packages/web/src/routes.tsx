import { RootRoute, Route, Outlet } from '@tanstack/react-router'
import { HomePage } from './shared/home.page'
import { DashboardShell } from './features/session/dashboard.shell'
import { LoginPage } from './features/session/login'
import { AliasList } from './features/shortcuts/list'
import { AliasDetail } from './features/shortcuts/detail'
import { AnalyticsPage } from './features/analytics/dashboard'
import { HealthChecker } from './features/health/checker'
import { MigratePage } from './features/backup/migrate'

const root = new RootRoute({
  component: () => (
    <>
      <Outlet />
    </>
  ),
})

const home = new Route({ getParentRoute: () => root, path: '/', component: HomePage })

const dash = new Route({ getParentRoute: () => root, path: '/dashboard', component: DashboardShell })
const dashLogin = new Route({ getParentRoute: () => dash, path: '/login', component: LoginPage })
const dashLinks = new Route({ getParentRoute: () => dash, path: '/links', component: AliasList })
const dashLink = new Route({ getParentRoute: () => dash, path: '/link/$alias', component: AliasDetail })
const dashStats = new Route({ getParentRoute: () => dash, path: '/analysis', component: AnalyticsPage })
const dashCheck = new Route({ getParentRoute: () => dash, path: '/check', component: HealthChecker })
const dashMigrate = new Route({ getParentRoute: () => dash, path: '/migrate', component: MigratePage })

export const routeTree = root.addChildren([
  home,
  dash.addChildren([dashLogin, dashLinks, dashLink, dashStats, dashCheck, dashMigrate]),
])

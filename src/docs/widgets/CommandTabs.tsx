import { PACKAGE_MANAGERS, type PackageManager } from "../core/install"
import { useSettings } from "../core/settings"
import { CodeBlock, Tabs } from "../kit"

export function CommandTabs({ command, label = "Package manager", title = "Terminal" }: { command: (pm: PackageManager) => string; label?: string; title?: string }) {
  const { packageManager, setPackageManager } = useSettings()
  return (
    <Tabs
      label={label}
      variant="pill"
      value={packageManager}
      onValueChange={(id) => setPackageManager(id as PackageManager)}
      items={PACKAGE_MANAGERS.map((pm) => ({
        id: pm,
        label: pm,
        content: () => <CodeBlock code={command(pm)} lang="bash" title={title} />,
      }))}
    />
  )
}

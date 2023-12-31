import "@logseq/libs"
import { PageEntity } from "@logseq/libs/dist/LSPlugin.user"
import { setup, t } from "logseq-l10n"
import { render } from "preact"
import Hierarchy from "./comps/Hierarchy"
import zhCN from "./translations/zh-CN.json"

async function main() {
  await setup({ builtinTranslations: { "zh-CN": zhCN } })

  provideStyles()

  document.body.addEventListener("click", closePopover)

  logseq.App.registerUIItem("pagebar", {
    key: "kef-hj-entry",
    template: `<a id="kef-hj-entry" class="button" data-on-click="show">&#xf289;</a>`,
  })

  injectVars()
  const themeModeOff = logseq.App.onThemeModeChanged(() =>
    setTimeout(injectVars, 100),
  )
  const themeOff = logseq.App.onThemeChanged(() => setTimeout(injectVars, 100))

  const routeOff = logseq.App.onRouteChanged(({ template, parameters }) => {
    onRouteChange(template, parameters)
  })

  logseq.beforeunload(async () => {
    routeOff()
    themeOff()
    themeModeOff()
    document.body.removeEventListener("click", closePopover)
  })

  console.log("#hierarchy-jump loaded")
}

function provideStyles() {
  logseq.provideStyle({
    key: "kef-hj",
    style: `
    #kef-hj-entry {
      font-family: "tabler-icons";
      margin: 0 4px;
    }
    `,
  })
}

function injectVars() {
  const vars = parent.getComputedStyle(parent.document.documentElement)
  document.documentElement.style.setProperty(
    "--kef-hj-text-color",
    vars.getPropertyValue("--ls-primary-text-color"),
  )
  document.documentElement.style.setProperty(
    "--kef-hj-bg-color",
    vars.getPropertyValue("--ls-secondary-background-color"),
  )
  document.documentElement.style.setProperty(
    "--kef-hj-shadow-color",
    vars.getPropertyValue("--ls-block-bullet-color"),
  )
  document.documentElement.style.setProperty(
    "--kef-hj-active-color",
    vars.getPropertyValue("--ls-active-primary-color"),
  )
  document.documentElement.style.setProperty(
    "--kef-hj-active-bg-color",
    vars.getPropertyValue("--ls-menu-hover-color"),
  )
  document.documentElement.style.setProperty(
    "--kef-hj-font-family",
    vars.getPropertyValue("--ls-font-family"),
  )
}

function closePopover() {
  const root = document.getElementById("root")!
  render(null, root)
  logseq.hideMainUI({ restoreEditingCursor: true })
}

async function getNamespaceRoot(page: PageEntity) {
  let root: PageEntity | null = page

  while (root?.namespace?.id) {
    root = await logseq.Editor.getPage(root.namespace.id)
  }

  return root
}

async function isNamespace(page: PageEntity) {
  const result = await logseq.DB.q(`(namespace "${page.name}")`)
  return result && result.length > 0
}

async function onRouteChange(template: string, parameters: any) {
  if (template !== "/page/:name") {
    hideButton()
    return
  }

  const pageName: string = parameters.path.name
  const page = await logseq.Editor.getPage(pageName)
  if (page == null || (!page.namespace && !(await isNamespace(page)))) {
    hideButton()
  } else {
    showButton()
  }
}

function hideButton() {
  setTimeout(() => {
    const button = parent.document.getElementById("kef-hj-entry")
    if (button != null) {
      button.style.display = "none"
    }
  }, 32)
}

function showButton() {
  setTimeout(() => {
    const button = parent.document.getElementById("kef-hj-entry")
    if (button != null) {
      button.style.display = ""
    }
  }, 32)
}

const model = {
  async show() {
    const root = document.getElementById("root")!
    const route = (parent.logseq as any).api.get_state_from_store("route-match")
    const page = await logseq.Editor.getPage(route.pathParams?.name)

    if (page == null) {
      await logseq.UI.showMsg(t("No page detected."), "error")
      return
    }

    if (!page.namespace && !(await isNamespace(page))) {
      await logseq.UI.showMsg(t("No hierarchy detected."), "info")
      return
    }

    const nsPage = await getNamespaceRoot(page)

    if (nsPage == null) {
      await logseq.UI.showMsg(t("Can't get the namespace page."), "error")
      return
    }

    const rect = (await (logseq.UI as any).queryElementRect("#kef-hj-entry"))!
    root.style.translate = `calc(${rect.right}px - 100%) ${rect.bottom + 20}px`

    render(
      <div class="kef-hj-container">
        <a
          class="kef-hj-pro"
          href="https://github.com/sethyuan/logseq-hierarchy-jump"
          target="_blank"
        >
          {t("Get Pro 🛒")}
        </a>
        <Hierarchy activePage={page} ns={nsPage} pageNameIndex={0} />
      </div>,
      root,
    )

    logseq.showMainUI({ autoFocus: true })
  },
}

logseq.ready(model, main).catch(console.error)

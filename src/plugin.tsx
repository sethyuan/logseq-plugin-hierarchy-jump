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
    template: `<a id="kef-hj-entry" data-on-click="show">&#xf289;</a>`,
  })

  injectVars()
  const themeModeOff = logseq.App.onThemeModeChanged(() => injectVars())
  const themeOff = logseq.App.onThemeChanged(() => injectVars())

  logseq.beforeunload(async () => {
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
      cursor: pointer;
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

    const rect = (await logseq.App.queryElementRect("#kef-hj-entry"))!
    root.style.top = `${rect.bottom + 20}px`
    root.style.left = `${rect.right}px`

    render(<Hierarchy activePage={page} ns={nsPage} pageNameIndex={0} />, root)

    logseq.showMainUI({ autoFocus: true })
  },
}

logseq.ready(model, main).catch(console.error)

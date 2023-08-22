import "@logseq/libs"
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

  logseq.beforeunload(async () => {
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

function closePopover() {
  logseq.hideMainUI({ restoreEditingCursor: true })
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

    if (!page.namespace) {
      await logseq.UI.showMsg(t("No hierarchy detected."), "info")
      return
    }

    const nsPage = await logseq.Editor.getPage(page.namespace.id)

    if (nsPage == null) {
      await logseq.UI.showMsg(t("Can't get the namespace page."), "error")
      return
    }

    const rect = (await logseq.App.queryElementRect("#kef-hj-entry"))!
    root.style.top = `${rect.top + rect.height + 10}px`
    root.style.left = `${rect.left}px`

    render(<Hierarchy ns={nsPage} />, root)

    logseq.showMainUI({ autoFocus: true })
  },
}

logseq.ready(model, main).catch(console.error)

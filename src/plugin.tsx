import "@logseq/libs"
import { setup } from "logseq-l10n"
import zhCN from "./translations/zh-CN.json"

async function main() {
  await setup({ builtinTranslations: { "zh-CN": zhCN } })

  // provideStyles()

  logseq.beforeunload(async () => {})

  console.log("#hierarchy-jump loaded")
}

// function provideStyles() {
//   logseq.provideStyle({
//     key: "kef-tr",
//     style: `
//     `,
//   })
// }

logseq.ready(main).catch(console.error)

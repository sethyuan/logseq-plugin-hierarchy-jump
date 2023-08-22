import { PageEntity } from "@logseq/libs/dist/LSPlugin.user"

type HierarchyProps = {
  ns: PageEntity
}

export default function Hierarchy({ ns }: HierarchyProps) {
  return <div class="kef-hj-popover">{ns.originalName}</div>
}

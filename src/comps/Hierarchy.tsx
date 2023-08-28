import { PageEntity } from "@logseq/libs/dist/LSPlugin.user"
import { useCallback, useEffect, useState } from "preact/hooks"
import { cls } from "reactutils"

type HierarchyProps = {
  activePage: PageEntity
  ns: PageEntity
  pageNameIndex: number
}

const PageIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="kef-hj-icon" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
<path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
<path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>
</svg>`

export default function Hierarchy({
  activePage,
  ns,
  pageNameIndex,
}: HierarchyProps) {
  const [nodes, setNodes] = useState<PageEntity[]>()

  useEffect(() => {
    ;(async () => {
      const dbResult = (await logseq.DB.q(`(namespace "${ns.name}")`)) as
        | PageEntity[]
        | null
      if (dbResult) {
        setNodes(dbResult)
      }
    })()
  }, [])

  const goto = useCallback(() => {
    ;(logseq.Editor.scrollToBlockInPage as any)(ns.name)
  }, [])

  return (
    <div class="kef-hj-node">
      <div class="kef-hj-name" onClick={goto}>
        <span dangerouslySetInnerHTML={{ __html: PageIcon }} />{" "}
        <span class={cls(ns.name === activePage.name && "kef-hj-active")}>
          {ns.originalName.substring(pageNameIndex)}
        </span>
      </div>
      {nodes && nodes.length > 0 && (
        <section class="kef-hj-subnodes">
          {nodes.map((node) => (
            <Hierarchy
              key={node.name}
              activePage={activePage}
              ns={node}
              pageNameIndex={ns.originalName.length + 1}
            />
          ))}
        </section>
      )}
    </div>
  )
}

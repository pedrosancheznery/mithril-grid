var m = require("mithril")

module.exports = {
  oninit: (vnode) => {
    let state = this
    state.paginate = false
    state.doneLoad = false
    state.search = false
    state.currentPage = state.page = 1
    vnode.attrs.title ? state.title=vnode.attrs.title : state.title=""
    m.request({
      method: "GET",
      url: vnode.attrs.url,
      data: {"sidx": vnode.attrs.index, "sord": vnode.attrs.order, "_search": false, "page": "1", "rows": vnode.attrs.rows}
    })
    .then((z)=>{
      state.data = z
      state.doneLoad=true
      if (state.data.total > 1) {
        state.paginate = true
        state.pages = []
        state.currentPage = 1
        for (let i = 0; i < state.data.total; i++) {
          state.pages.push(i+1)
        }
      }
    })
  },
  onupdate: (vnode) => {
    let state = this
    let data = {
      "sidx": vnode.attrs.index, 
      "sord": vnode.attrs.order, 
      "rows": vnode.attrs.rows, 
      "_search": state.search
    }

    if (state.search) {
      let input = document.getElementById('myFilter').value;
      let filters = {
        "groupOp":vnode.attrs.filters.groupOp, 
        "rules": []
      }
      vnode.attrs.filters.rules.map((z)=>filters.rules.push({"field": z.field, "op": z.op, "data": `${input}`}))
      data.page = 1
      data.filters = JSON.stringify(filters)
    } else {
      data.page = state.page
      // data.filters = null
    }


    if (state.search) {
      m.request({
        method: "GET",
        url: vnode.attrs.url,
        data: data
      })
      .then((z)=>{
        state.data = z
        state.search = false
        // state.currentPage = state.page = 1
        if (z.total == 1) {
          state.paginate = false
        } else {
          state.paginate = true
          state.pages = []
          state.currentPage = 1
          for (let i = 0; i < state.data.total; i++) {
            state.pages.push(i+1)
          }
        }
      })
    }
    if (state.page != state.currentPage) {
      m.request({
        method: "GET",
        url: vnode.attrs.url,
        data: data
      })
      .then((z)=>{
        state.data = z
        state.currentPage = state.page
      })
    }
  },
  view: (vnode) =>  {
    let state = this
    return m("#myGrid", [
        m("h3", state.title),
        vnode.attrs.search ? [
          m("form.uk-search.uk-search-default", 
            m("input.uk-search-input#myFilter[type='search'][placeholder='Search...']",{
              onkeyup: ()=>{
                state.search = true
              }
            })
          )
        ] : null,
        m("table", {class: vnode.attrs.class}, 
          m("tr",
            vnode.attrs.columns.map((c)=>m("th", c))
          ),
          state.doneLoad ? [
            state.data.rows.map((z)=>{
              return m("tr", {id: z.id, href: `/persons/${z.id}`, oncreate: m.route.link},
                vnode.attrs.fields.map((y)=>m("td", z.cell[y]))
              )}
            )
          ] : null
        ),
        state.data != null ? m("p", `${state.data.records} record(s) found`) : null,
        m("#pagination", 
          state.paginate ? [
            m("ul.uk-pagination", 
              m("li", m("span[uk-pagination-previous]", {onclick: ()=>state.page=state.currentPage-1})),
              state.pages.map((z)=>m("li", m("a[href=#", {onclick: ()=>state.page=z}, z))),
              m("li", m("span[uk-pagination-next]", {onclick: ()=>state.page=state.currentPage+1}))
            )
          ] : null
        )
      ]
    )
  }
}

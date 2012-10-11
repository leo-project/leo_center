Highcharts.setOptions({
  # disable credit of Highcharts.com
  credits: { enabled: false },
  global: { useUTC: false }
})

Ext.onReady(->
  node_status = Ext.create("LeoTamer.Nodes")

  tabs = Ext.create("Ext.TabPanel", {
    region: "center",
    activeTab: 0,
    defaults :{ bodyPadding: 10 },
    items: [
      node_status,
    ]
  })

  viewport = Ext.create("Ext.Viewport", {
    layout:"border",
    items: tabs
  })
)

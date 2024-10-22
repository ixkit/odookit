/** @odoo-module **/
import { registry } from "@web/core/registry";
import { session } from "@web/session";
import { _t } from "@web/core/l10n/translation";
import { Component } from "@odoo/owl";
import { onWillStart, onMounted,onWillUnmount, onWillDestroy, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks"; 
import { ConfirmationDialog, AlertDialog } from "@web/core/confirmation_dialog/confirmation_dialog";

const actionRegistry = registry.category("actions");
 
export class CodeDashboard extends Component {
  //Initializes the CodeDashboard component,
  setup() {
    super.setup(...arguments);
    this.dialog = useService("dialog");
    
    //message bus
    const listenBus = (payload) => {
      this.onMessage(payload)
    }
    this.busService = this.env.services.bus_service;
    this.channel = "eventChannel";
    this.busService.addChannel(this.channel);
    // this.busService.addEventListener("notification", this.onMessage.bind(this))
    this.busService.subscribe("notification",  listenBus);

    this.orm = useService("orm");
    //this.user = useService("user");
    this.actionService = useService("action");

    const that = this;

    this.state = useState({
      serverStatus: "ready",
      coderServer: null,
      codeServerTip: null,
      runtimeEnv: {}, //odoo runtime env
    });

    // When the component is about to start, fetch data in tiles
    onWillStart(async () => {
      await this.fetch_data();
    });
    //When the component is mounted, render various charts
    onMounted(async () => {
      await this.render_server_status();

      this._initConsole();
      //this.mockInput();

      this.getOdooEnv();
    });
    onWillUnmount(() => {
      this.setTimerHandler(null);
    });

    onWillDestroy(() => {
      if (that.mockTyping) {
        window.clearTimeout(this.mockTyping);
      }
      //this.busService.removeEventListener("notification", this.onMessage);
      this.busService.unsubscribe("notification", listenBus);
      this.busService.deleteChannel('eventChannel')
    });
  }
  _initConsole() {
    const container = "#termynal";
    const termynal = new Termynal(container);
    this.termynal = termynal;  
  }

  async mockInput() {
    // await this.onclick_pos_sales('Hourly');
    if (!this.termynal) {
      return;
    }
    const termynal = this.termynal;
    const that = this;
    function output() {
      termynal.appendLine("Hello line @" + Date.now());
      that.mockTyping = setTimeout(output, 3000);
      try {
        that.gotoLastLineIfNeeds();
      } catch (ex) {
        console.error("failed mockInput, ex?", ex);
      }
    }
    setTimeout(output, 3000);
  }
  // array ?
  async pathStatus(strOrArray) {
    if (!strOrArray) return;
    var out;
    if (Array.isArray(strOrArray)) {
      out = strOrArray[0];
    } else {
      out = strOrArray;
    }
    if (!out) return;

    // Stop Code Server
    // Start Code Server
    let refresh = false;
    if (out.includes("Stop Code Server")) {
      refresh = true;
      this.setServerStatus("ready");
    }
    if (out.includes("Start Code Server")) {
      refresh = true;
      this.setServerStatus("running");
    }
    return;
    if (!refresh) return;

    const that = this;
    setTimeout(() => {
      that.setServerStatus();
      that.render_server_status();
    }, 1000);
  }
  /*
    {
    "data": {
        "message": "{\"stdout\": [\"2024-10-22T04:21:58.341Z root INFO Changed application state from 'ready' to 'closing_window'.\"]}",
        "ts": "2024-10-22 04:21:58"
    },
    "channel": "eventChannel"
    }
    */
  onMessage(playload) {
    const that = this;

    const data = playload.data;
    const message = JSON.parse(data.message);
    let out = message.stdout;
    if (!out) {
      out = message.stderr;
    }
    if (!out) {
      out = JSON.stringify(message);
    }
    try {
      that.echo(out);
      that.gotoLastLineIfNeeds();
    } catch (ex) {}
  }

  onMessage_17({ detail: notifications }) {
    console.debug("onMessage, detail?", detail);
    notifications = notifications.filter(
      (item) => item.payload.channel === this.channel
    );

    const that = this;
    notifications.forEach((item) => {
      const data = item.payload.data;
      const message = JSON.parse(data.message);
      let out = message.stdout;
      if (!out) {
        out = message.stderr;
      }
      if (!out) {
        out = JSON.stringify(message);
      }
      try {
        that.echo(out);
        that.gotoLastLineIfNeeds();
      } catch (ex) {}
    });
  }

  async echo(msg) {
    const termynal = this.termynal;
    termynal.appendLine(msg);
  }

  async gotoLastLineIfNeeds() {
    const container = "#termynal";
    try {
      const elt = document.getElementById(container); // $( container).get(0);
      if (!elt) return;
      elt.animate({ scrollTop: elt.scrollHeight }, 5000);
    } catch (ex) {
      console.error(ex);
    }
  }

  async fetch_data() {}

  on_ctrl_server() {
    const op = this.state.serverStatus === "ready" ? "start" : "stop";
    const opTip = op === "start" ? "🚀 Start" : "❌ Stop";
    const prompt = `${opTip} Code Server?`;
    const that = this;
    this.dialog.add(ConfirmationDialog, {
      title: _t("Confirm"),
      body: _t(prompt),
      confirm: async () => {
        await this._do_ctrl_server();
      },
      confirmLabel: _t("OK"),
      cancel: () => {},
      cancelLabel: _t("Cancel"),
    });
  }
  getCodeServerUrl() {
    const coderServer = this.state.coderServer;
    if (!coderServer) {
      return null;
    }
    return coderServer.url;

    return this.state.codeServerUrl;
    const port = "3030";
    const o = window.location.origin;
    const list = o.split(":");
    return `${list[0]}:${list[1]}:${port}`;
  }

  toCodeServerTip(status) {
    let op = status === "ready" ? "start" : "stop";
    op = op.charAt(0).toUpperCase() + op.slice(1);
    let result = `Click the server icon to ${op} the Code Server`;
    return result;
  }

  async _do_ctrl_server() {
    const that = this;

    const op = this.state.serverStatus === "ready" ? "start" : "stop";

    this.orm
      .call("kit.code.server", "ctrl_server", [op])
      .then(function (result) {
        //anyway refresh the UI
        that.startCheckStatus();
      });
  }
  async startCheckStatus(delay = 2000) {
    const that = this;
    const timerHandler = setTimeout(() => {
      that.render_server_status((x) => {
        if (x === "running") {
          try {
            if (that) {
              that.onCodeServerStarted();
            }
          } catch (ex) {}
          return;
        }
        if (that) {
          that.startCheckStatus(3000);
        }
      });
    }, delay);

    this.setTimerHandler(timerHandler);
  }
  setTimerHandler(timer) {
    const existTimer = this._timerHandler;
    if (existTimer) {
      clearTimeout(existTimer);
    }
    this._timerHandler = timer;
  }
  async onCodeServerStarted() {
    const that = this;
    const size = 1;
    setTimeout(() => {
      if (1 > 10) {
        const url = that.getCodeServerUrl();
        that._openCodeServerPage(url);
      } else {
        that._openHome();
      }

      // should do this job in server internal
      that.pushSpaceToCodeServer();
    }, 1000 * size);
  }

  async handleCickCodeServer() {
    const that = this;
    const url = that.getCodeServerUrl();
    if (!url || "" === url) return;
    that._openCodeServerPage(url);
  }

  async _openCodeServerPage(url) {
    const that = this;
    const tab = window.open(url, "modal=false,alwaysRaised=yes");
  }

  //status = "running" | "ready"
  setServerStatus(status) {
    try {
      this.state.serverStatus = status;
      this.state.codeServerTip = this.toCodeServerTip(status);
    } catch (ex) {}
  }

  fetchServerInfo(onResult) {
    const that = this;
    this.orm
      .call("kit.code.server", "fetch_server_info")
      .then(function (rpcResult) {
        if (rpcResult) {
          if (rpcResult.success) {
            const server_info = rpcResult.data;
            that.state.coderServer = server_info;
            onResult.apply(null, ["running"]);
            return;
          }
        }
        that.state.coderServer = null;
        onResult.apply(null, ["ready"]);
      });
  }
  async render_server_status(onStatusResult) {
    const that = this;
    this.fetchServerInfo((x) => {
      that.setServerStatus(x);
      if (!onStatusResult) {
        return;
      }

      onStatusResult.apply(null, [x]);
    });
  }
  async getOdooEnv(onResult) {
    const that = this;
    this.orm
      .call("kit.code.server", "report_configuration")
      .then(function (data) {
        that.state.runtimeEnv = data;
        that.renderOdooEnvData(data);
      });
  }
  renderOdooEnvData(data) {
    this.jsonTable = new JsonViewer({
      value: data,
    }).render("#jsonTable");
  }
  async pushSpaceToCodeServer() {
    const that = this;
    this.orm
      .call("kit.code.server", "push_space_to_code_server")
      .then(function (data) {});
  }

  async _openHome() {
    const intent = {
      module: "kit_code",
      file: "__manifest__.py",
      lineNo: 1,
    };
    const that = this;
    this.orm.call("kit.code.server", "get_home_link", []).then(function (data) {
      const url = data.navigateTo;
      that._openCodeServerPage(url);
    });
  }
  /*
        name:web.NavBar.DropdownItem
        class:sub template
        type:owl
        url:/web/static/src/webclient/navbar/navbar.xml
        file:/odoo/addons/web/static/src/webclient/navbar/navbar.xml
    */
  async _openFile() {
    const intent = {
      name: "web.NavBar.DropdownItem",
      url: "/web/static/src/webclient/navbar/navbar.xml",
      file: "/odoo/addons/web/static/src/webclient/navbar/navbar.xml",
      lineNo: 99,
    };
    const that = this;
    this.orm
      .call("kit.code.server", "get_editable_file", [intent])
      .then(function (data) {
        const url = data.navigateTo;
        that._openCodeServerPage(url);
      });
  }
}
CodeDashboard.template = 'CodeDashboard'
registry.category("actions").add("open_code_dashboard", CodeDashboard)

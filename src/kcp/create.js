export const IKCP_RTO_NDL = 30
export const IKCP_RTO_MIN = 100
export const IKCP_RTO_DEF = 200
export const IKCP_RTO_MAX = 60000
export const IKCP_ASK_SEND = 1
export const IKCP_ASK_TELL = 2
export const IKCP_WND_SND = 32
export const IKCP_WND_RCV = 32
export const IKCP_MTU_DEF = 1400
export const IKCP_ACK_FAST = 3
export const IKCP_INTERVAL = 100
export const IKCP_DEADLINK = 20
export const IKCP_THRESH_INIT = 2
export const IKCP_THRESH_MIN = 2
export const IKCP_PROBE_INIT = 7000 // 7 secs to probe window size
export const IKCP_PROBE_LIMIT = 120000 // up to 120 secs to probe window
export const IKCP_OVERHEAD = 24
export const IKCP_CMD_PUSH = 81
export const IKCP_CMD_ACK = 82
export const IKCP_CMD_WASK = 83
export const IKCP_CMD_WINS = 84

// @private
export const DEFAULT_KCPCB = {
  conv: null,
  user: null,
  snd_una: 0,
  snd_nxt: 0,
  rcv_nxt: 0,
  ts_probe: 0,
  probe_wait: 0,
  snd_wnd: IKCP_WND_SND,
  rcv_wnd: IKCP_WND_RCV,
  rmt_wnd: IKCP_WND_RCV,
  cwnd: 0,
  incr: 0,
  probe: 0,
  mtu: IKCP_MTU_DEF,
  stream: 0,
  mss: IKCP_MTU_DEF - IKCP_OVERHEAD,
  buffer: null,
  snd_queue: null,
  rcv_queue: null,
  snd_buf: null,
  rcv_buf: null,
  nrcv_buf: 0,
  nsnd_buf: 0,
  nrcv_que: 0,
  nsnd_que: 0,

  state: 0,
  acklist: null,
  ackblock: 0,
  ackcount: 0,
  rx_srtt: 0,
  rx_rttval: 0,
  rx_rto: IKCP_RTO_DEF,
  rx_minrto: IKCP_RTO_MIN,
  current: 0,
  interval: IKCP_INTERVAL,
  ts_flush: IKCP_INTERVAL,
  nodelay: 0,
  updated: 0,
  // logmask: 0,
  ssthresh: IKCP_THRESH_INIT,
  fastresend: 0,
  nocwnd: 0,
  xmit: 0,
  dead_link: IKCP_DEADLINK,
  output: null,
  // writelog: null,
}

export function create(conv, user) {
  const instance = Object.assign({}, DEFAULT_KCPCB, {
    conv,
    user,
    snd_queue: [],
    rcv_queue: [],
    snd_buf: [],
    rcv_buf: [],
    acklist: [],
  })

  return instance
}

export function createSegment() {
  return {
    conv: 0,
    cmd: 0,
    frg: 0,
    wnd: 0,
    ts: 0,
    sn: 0,
    una: 0,
    len: 0,
    resendts: 0,
    rto: 0,
    fastack: 0,
    xmit: 0,
    data: null,
  }
}

export function setMtu(kcp, mtu) {
  if (mtu < 50 || mtu < IKCP_OVERHEAD) {
    return -1
  }

  kcp.mtu = mtu
  kcp.mss = kcp.mtu - IKCP_OVERHEAD

  return 0
}

export function setOutput(kcp, output) {
  kcp.output = output
}

export function setWndSize(kcp, snd_wnd, rcv_wnd) {
  if (kcp) {
    if (snd_wnd > 0) {
      kcp.snd_wnd = snd_wnd
    }

    if (rcv_wnd > 0) {
      kcp.rcv_wnd = rcv_wnd
    }
  }
}

export function setNodelay(kcp, nodelay, interval, fastresend, nocwnd) {
  if (nodelay >= 0) {
    kcp.nodelay = nodelay
    if (nodelay) {
      kcp.rx_minrto = IKCP_RTO_NDL
    } else {
      kcp.rx_minrto = IKCP_RTO_MIN
    }
  }

  if (interval >= 0) {
    if (interval > 5000) {
      kcp.interval = 5000
    } else if (interval < 10) {
      kcp.interval = 10
    } else {
      kcp.interval = interval
    }
  }

  if (fastresend >= 0) {
    kcp.fastresend = fastresend
  }

  if (nocwnd >= 0) {
    kcp.nocwnd = nocwnd
  }

  return 0
}

const DIRECT_SETTING_PROPERTIES = [
  'stream',
  'rx_minrto',
]

export function setOptions(kcp, opt) {
  const { nodelay = -1, interval = -1, fastresend = -1, nocwnd = -1 } = opt
  setNodelay(kcp, nodelay, interval, fastresend, nocwnd)

  const { snd_wnd = -1, rcv_wnd = -1 } = opt
  setWndSize(kcp, snd_wnd, rcv_wnd)

  const { mtu = -1 } = opt
  setMtu(kcp, mtu)

  DIRECT_SETTING_PROPERTIES.forEach((name) => {
    if (opt[name] !== undefined) {
      kcp[name] = opt[name]
    }
  })
}

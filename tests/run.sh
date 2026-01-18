#!/usr/bin/env bash
reset() {
  unset NO_CONSTPROP
  unset NO_COPYPROP
  unset NO_WBR
  unset NO_DCE
  unset NO_EPROP
  unset NO_RKEYCAST
  unset NO_REDKEYCAST
  unset NO_DEADBR
}

NOOPT() {
  reset
  export NO_CONSTPROP=1
  export NO_COPYPROP=1
  export NO_WBR=1
  export NO_DCE=1
  export NO_EPROP=1
  export NO_RKEYCAST=1
  export NO_REDKEYCAST=1
  export NO_DEADBR=1
  python3 bm.py
}

CPROP() {
  reset
  # export NO_CONSTPROP=1
  # export NO_COPYPROP=1
  export NO_WBR=1
  export NO_DCE=1
  export NO_EPROP=1
  export NO_RKEYCAST=1
  export NO_REDKEYCAST=1
  export NO_DEADBR=1
  python3 bm.py
}

CPROPWBR() {
  reset
  # export NO_CONSTPROP=1
  # export NO_COPYPROP=1
  # export NO_WBR=1
  export NO_DCE=1
  export NO_EPROP=1
  export NO_RKEYCAST=1
  export NO_REDKEYCAST=1
  export NO_DEADBR=1
  python3 bm.py
}

CPROPWBRDCE() {
  reset
  # export NO_CONSTPROP=1
  # export NO_COPYPROP=1
  # export NO_WBR=1
  # export NO_DCE=1
  export NO_EPROP=1
  export NO_RKEYCAST=1
  export NO_REDKEYCAST=1
  export NO_DEADBR=1
  python3 bm.py
}

CPROPWBRDCEEPROP() {
  reset
  # export NO_CONSTPROP=1
  # export NO_COPYPROP=1
  # export NO_WBR=1
  # export NO_DCE=1
  # export NO_EPROP=1
  # export NO_RKEYCAST=1
  # export NO_REDKEYCAST=1
  # export NO_DEADBR=1
  python3 bm.py
}

export PRINT_OPT_STAT=1
echo "No OPT"
NOOPT

echo "CPROP"
CPROP

echo "CPROP + WBR"
CPROPWBR

echo "CPROP + WBR + DCE"
CPROPWBRDCE

echo "CPROP + WBR + DCE + EPROP"
CPROPWBRDCEEPROP
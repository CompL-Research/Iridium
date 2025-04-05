#!/bin/bash

wd=$(pwd)
iridium=$(
    cat <<-END
#!/bin/bash
# Uncomment the following line to run using node
node --import=tsx $wd/iridium.ts \$*

# BunJS is the default execution env, recommended
# bun --import=tsx $wd/iridium.ts \$*
END
)

# 1. Save iridium binary (untouched)
echo "[Saved iridium binary (untouched)] ${wd}/iridium_interp"
echo "$iridium" >iridium_interp
chmod +x iridium_interp

# 2. Install Bun
if which bun >/dev/null; then
  echo "[Building...]"
  bun install
  echo "[Saved iridium binary (compiled, minified)] ${wd}/iridium"
  bun build ./iridium.ts --compile --minify --sourcemap --outfile iridium
else
  echo "bun not found, skipping build step"
  exit 1
fi

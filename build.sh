#!/bin/bash

wd=$(pwd)
iridium=$(
    cat <<-END
#!/bin/bash
# Uncomment this to run using node
# node --import=tsx $wd/iridium.ts \$*

# BunJS is the default execution env, recommended
bun --import=tsx $wd/iridium.ts \$*
END
)

# 2. Install Bun
if which bun >/dev/null; then
    echo "[Building...]"
    bun install
    echo "[Saved iridium binary (untouched)] ${wd}/iridium_interp"
    echo "$iridium" >iridium_interp
    chmod +x iridium_interp

    echo "[Saved iridium binary (compiled, minified)] ${wd}/iridium"
    bun build ./iridium.ts --compile --minify --sourcemap --outfile iridium

else
    echo "bun not found"
    exit 1
fi

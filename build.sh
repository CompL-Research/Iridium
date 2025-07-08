#!/bin/bash

wd=$(pwd)
iridium=$(
    cat <<-END
#!/bin/bash
# Uncomment the following line to run using node
node --import=tsx $wd/iridium.ts \$*
END
)

# 1. Save iridium binary
echo "[Saved iridium binary] ${wd}/iridium"
echo "$iridium" >iridium
chmod +x iridium
#!/bin/bash

set -e

# Node + npm are required
if command -v node &>/dev/null && command -v npm &>/dev/null; then 
  echo "[Node + npm] found";
else 
  echo "[Node + npm] missing...";
  exit 1;
fi

# Get Forge and QuickJS
git submodule update --init external/Iridium-Forge/
git submodule update --init external/Iridium-Quickjs/

# Build Forge
pushd external/Iridium-Forge > /dev/null
npm install
npm run build
popd > /dev/null

# Build QuickJS 
pushd external/Iridium-Quickjs > /dev/null
make debug 
popd > /dev/null

# Install Iridium Deps 
npm install

wd=$(pwd)
iridium=$(
    cat <<-END
#!/bin/bash
export NVM_DIR="\$HOME/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
exec node --max-old-space-size=8192 --import=tsx $wd/iridium.ts \$*
END
)

# Save the iridium binary script to a file and make it executable
echo "$iridium" >iridium
chmod +x iridium

./iridium

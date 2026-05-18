#!/bin/bash

# Define NVM_DIR and source nvm.sh to make nvm available in this script session
export NVM_DIR="$HOME/.nvm"

# 1. Install/Load NVM & Node
# Check if nvm is installed, if not, install it.
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
    echo "[NVM not found. Installing...]"
    # Ensure curl is installed before trying to use it
    which curl &>/dev/null || sudo apt-get update && sudo apt-get install -y curl
    # Download and run the nvm installer script
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

# Source nvm.sh to load nvm into the current script session
\. "$NVM_DIR/nvm.sh"
echo "[NVM is loaded.]"

# Now, use nvm to install the latest Long-Term Support (LTS) version of Node.js if it's not already installed.
if ! nvm list | grep -q "lts"; then
    echo "[Node.js LTS not found. Installing...]"
    nvm install --lts
fi

# Ensure the LTS version is being used for this session
nvm use --lts

# 2. Install Dependencies
echo "[Installing project dependencies with npm...]"
npm install

# 3. Create Binary
echo "[Creating 'iridium' executable...]"
wd=$(pwd)
iridium=$(
    cat <<-END
#!/bin/bash
# The executable also needs to load nvm to find the correct node version
export NVM_DIR="\$HOME/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
exec node --max-old-space-size=8192 --import=tsx $wd/iridium.ts \$*
END
)

# Save the iridium binary script to a file and make it executable
echo "$iridium" >iridium
chmod +x iridium

echo "[Setup complete! Attempting to run './iridium help'...]"
./iridium help

echo -e "\n✅ Setup finished successfully!"
echo "You can now run the program using './iridium <command>'."

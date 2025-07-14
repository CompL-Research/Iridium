#!/bin/bash

# 1. Install Node
if which node >/dev/null; then
    echo "[Node is already installed...]"
else
    which curl &>/dev/null || sudo apt install -y curl
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    source ~/.bashrc
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"                   # This loads nvm
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" # This loads nvm bash_completion
    nvm install --lts
fi

# 2. Install Dependencies
npm i

# 3. Create Binary
wd=$(pwd)
iridium=$(
    cat <<-END
#!/bin/bash
node --import=tsx $wd/iridium.ts \$*
END
)

# 1. Save iridium binary
echo "$iridium" >iridium
chmod +x iridium

./iridium help
#!/bin/bash

wd=`pwd`
iridium=$(cat <<-END
#!/bin/bash
node --import=tsx $wd/iridium.ts \$*
END
)

diridium=$(cat <<-END
#!/bin/bash
node --inspect --import=tsx $wd/iridium.ts \$*
END
)

echo "$iridium" > iridium
echo "$diridium" > diridium
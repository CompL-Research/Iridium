awk '/SAFE:/ {
    for (i=1; i<=NF; i++) {
        if ($i=="SAFE:")  safe += $(i+1)
        if ($i=="TOTAL:") total += $(i+1)
    }
} END { print "SAFE =", safe, "TOTAL =", total }' $1
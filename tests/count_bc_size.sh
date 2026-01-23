awk '/byte_code_len:/ {
    for (i=1; i<=NF; i++) {
        if ($i=="byte_code_len:")  bc_size += $(i+1)
    }
} END { print "bc_size =", bc_size }' $1
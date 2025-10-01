IRIDIUM (.iridium) ---> [VM*](Interpreter) ---> output

IRIDIUM (.iridium) + [VM*](Interpreter) ---> output

[IRIDIUM + SHL_INDEPENDELY_COMPILE_IPT] (.iridium{call SHLib}) ---> [VM*](Interpreter <--> Load/Link DLLs) ---> output

[IRIDIUM + INLINE_ASSEMBLY] (.iridium{call SHLib}) ---> [VM*](Interpreter <--> Load/Link DLLs) ---> output


  goto X; <- Generalizer => Special
  
BB0:
  goto 256; <- Special Instruction: 
  1B + 1B offset
BB1:

BBX:


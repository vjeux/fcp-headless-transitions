# Real bytes at VA 0x000000000077b170 (from `otool -X` of the binary):
#   55            pushq %rbp
#   48 89 e5      movq  %rsp, %rbp
#   0f be 47 08   movsbl 0x8(%rdi), %eax
#   5d            popq  %rbp
#   c3            retq
#
# Note: otool -tV's linear sweep mis-decoded the preceding bytes so it produced NO
# label for 0x77b170 and left `addb %dl, 0x48(%rbp)` / `movl %esp, %ebp` as bogus
# lines (the classic otool boundary artifact — the true instruction stream starting
# at 0x77b170 IS the standard `pushq %rbp; movq %rsp,%rbp` preamble, then a signed
# byte load from ivar +0x8 into %eax as the return value).
#
# nm -n confirms real address:
#   000000000077b170 t -[FFCancelTarget canceled]
-[FFCancelTarget canceled]:
000000000077b170	pushq	%rbp
000000000077b171	movq	%rsp, %rbp
000000000077b174	movsbl	0x8(%rdi), %eax
000000000077b178	popq	%rbp
000000000077b179	retq

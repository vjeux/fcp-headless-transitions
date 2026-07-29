__ZNK11OZImageNode13getResolutionERdS0_:
000000000008ce00	pushq	%rbp
000000000008ce01	movq	%rsp, %rbp
000000000008ce04	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
000000000008ce0e	movq	%rax, (%rdx)
000000000008ce11	movq	%rax, (%rsi)
000000000008ce14	popq	%rbp
000000000008ce15	retq
000000000008ce16	nopw	%cs:(%rax,%rax)

__ZN13OZChannelBase15getNextUniqueIDEv:
0000000000049c10	pushq	%rbp
0000000000049c11	movq	%rsp, %rbp
0000000000049c14	movl	$0x1, %eax
0000000000049c19	lock
0000000000049c1a	xaddl	%eax, __ZL12sIDGenerator(%rip)  ## sIDGenerator
0000000000049c21	popq	%rbp
0000000000049c22	retq
0000000000049c23	nop

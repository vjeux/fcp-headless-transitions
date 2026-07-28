__ZN37FFAudioGainChannelConstantValueBufferD1Ev:
0000000000e63fa0	pushq	%rbp
0000000000e63fa1	movq	%rsp, %rbp
0000000000e63fa4	leaq	0xab3f15(%rip), %rax
0000000000e63fab	movq	%rax, (%rdi)
0000000000e63fae	movq	0x8(%rdi), %rax
0000000000e63fb2	testq	%rax, %rax
0000000000e63fb5	je	0xe63fc4
0000000000e63fb7	movq	%rax, 0x10(%rdi)
0000000000e63fbb	movq	%rax, %rdi
0000000000e63fbe	popq	%rbp
0000000000e63fbf	jmp	0x1497404                       ## symbol stub for: __ZdlPv
0000000000e63fc4	popq	%rbp
0000000000e63fc5	retq
0000000000e63fc6	nopw	%cs:(%rax,%rax)

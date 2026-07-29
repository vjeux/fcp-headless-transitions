__ZN19PCBufferWriteStream8copyDataEv:
00000000000519c2	pushq	%rbp
00000000000519c3	movq	%rsp, %rbp
00000000000519c6	pushq	%r14
00000000000519c8	pushq	%rbx
00000000000519c9	subq	$0x10, %rsp
00000000000519cd	movq	%rdi, %rbx
00000000000519d0	movq	0xf5a69(%rip), %rax             ## literal pool symbol address: _kCFAllocatorDefault
00000000000519d7	movq	(%rax), %r14
00000000000519da	leaq	-0x11(%rbp), %rsi
00000000000519de	movb	$0x0, (%rsi)
00000000000519e1	movq	(%rdi), %rax
00000000000519e4	movl	$0x1, %edx
00000000000519e9	callq	*0x18(%rax)
00000000000519ec	movq	0x8(%rbx), %rsi
00000000000519f0	movq	0x10(%rbx), %rdx
00000000000519f4	decq	%rdx
00000000000519f7	movq	%rdx, 0x10(%rbx)
00000000000519fb	subq	%rsi, %rdx
00000000000519fe	movq	%r14, %rdi
0000000000051a01	callq	0xddf3a                         ## symbol stub for: _CFDataCreate
0000000000051a06	addq	$0x10, %rsp
0000000000051a0a	popq	%rbx
0000000000051a0b	popq	%r14
0000000000051a0d	popq	%rbp
0000000000051a0e	retq
0000000000051a0f	nop

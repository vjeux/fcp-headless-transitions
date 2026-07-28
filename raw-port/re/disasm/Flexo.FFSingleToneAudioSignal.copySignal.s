__ZNK23FFSingleToneAudioSignal10copySignalEv:
0000000001258f20	pushq	%rbp
0000000001258f21	movq	%rsp, %rbp
0000000001258f24	pushq	%rbx
0000000001258f25	pushq	%rax
0000000001258f26	movq	%rdi, %rbx
0000000001258f29	movl	$0x38, %edi
0000000001258f2e	callq	0x1497452                       ## symbol stub for: __Znwm
0000000001258f33	movq	0x8(%rbx), %rcx
0000000001258f37	movsd	0x30(%rbx), %xmm0
0000000001258f3c	movb	$0x0, 0x18(%rax)
0000000001258f40	movq	$0x0, 0x10(%rax)
0000000001258f48	leaq	0x6c8a91(%rip), %rdx
0000000001258f4f	movq	%rdx, (%rax)
0000000001258f52	movups	0x20(%rbx), %xmm1
0000000001258f56	movups	%xmm1, 0x20(%rax)
0000000001258f5a	movsd	%xmm0, 0x30(%rax)
0000000001258f5f	movq	%rcx, 0x8(%rax)
0000000001258f63	addq	$0x8, %rsp
0000000001258f67	popq	%rbx
0000000001258f68	popq	%rbp
0000000001258f69	retq
0000000001258f6a	nopw	(%rax,%rax)
